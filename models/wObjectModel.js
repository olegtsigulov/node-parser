const WObjectModel = require('database').models.WObject;
const ObjectTypes = require('database').models.ObjectType;
const { WOBJECT_LATEST_POSTS_COUNT } = require('utilities/constants');

const create = async (data) => {
  const newWObject = new WObjectModel(data);

  try {
    return { wObject: await newWObject.save() };
  } catch (error) {
    return { error };
  }
};

const update = async (conditions, updateData) => {
  try {
    const result = await WObjectModel.updateOne(conditions, updateData);
    return { result: result.nModified === 1 };
  } catch (error) {
    return { error };
  }
};

const addField = async (data) => {
  try {
    const result = await WObjectModel.updateOne(
      { author_permlink: data.author_permlink },
      {
        $push: {
          fields: data.field,
        },
      },
    );
    return { result: result.nModified === 1 };
  } catch (error) {
    return { error };
  }
};

// data include: author, permlink, author_permlink, weight
const increaseFieldWeight = async (data) => {
  try {
    const result = await WObjectModel.updateOne({
      author_permlink: data.author_permlink,
      'fields.author': data.author,
      'fields.permlink': data.permlink,
    }, {
      $inc: {
        'fields.$.weight': data.weight,
      },
    });
    return { result: result.nModified === 1 };
  } catch (error) {
    return { error };
  }
};

const increaseWobjectWeight = async (data) => {
  try {
    const wobj = await WObjectModel.findOne({ author_permlink: data.author_permlink });

    if (wobj) {
      await WObjectModel.updateOne(
        { author_permlink: data.author_permlink },
        { $inc: { weight: data.weight } },
      );
      await ObjectTypes.updateOne(
        { name: wobj.object_type },
        { $inc: { weight: data.weight } },
      );
      return { result: true };
    }
    return { result: false };
  } catch (error) {
    return { error };
  }
};

// data include: author, permlink, author_permlink, voter
const removeVote = async (data) => {
  try {
    const result = await WObjectModel.updateOne({
      author_permlink: data.author_permlink,
      'fields.author': data.author,
      'fields.permlink': data.permlink,
    }, {
      $pull: {
        'fields.$.active_votes': { voter: data.voter },
      },
    });
    return { result: result.nModified === 1 };
  } catch (error) {
    return { error };
  }
};

// data include: author, permlink, author_permlink, voter, weight
const addVote = async (data) => {
  try {
    const result = await WObjectModel.updateOne({
      author_permlink: data.author_permlink,
      'fields.author': data.author,
      'fields.permlink': data.permlink,
    },
    { $push: { 'fields.$.active_votes': { ...data.vote } } });
    return { result: result.nModified === 1 };
  } catch (error) {
    return { error };
  }
};

// method for redis restore wobjects author and author_permlink
const getWobjectsRefs = async () => {
  try {
    return {
      wobjects: await WObjectModel.aggregate([
        { $project: { _id: 0, author_permlink: 1, author: 1 } },
      ]),
    };
  } catch (error) {
    return { error };
  }
};

// method for redis restore fields author and author_permlink
const getFieldsRefs = async (authorPermlink) => {
  try {
    return {
      fields: await WObjectModel.aggregate([
        { $match: { author_permlink: authorPermlink } },
        { $unwind: '$fields' },
        { $addFields: { field_author: '$fields.author', field_permlink: '$fields.permlink' } },
        { $project: { _id: 0, field_author: 1, field_permlink: 1 } },
      ]),
    };
  } catch (error) {
    return { error };
  }
};

const getSomeFields = async (fieldName, authorPermlink) => {
  const pipeline = [
    { $match: { author_permlink: authorPermlink || /.*?/ } },
    { $unwind: '$fields' },
    { $match: { 'fields.name': fieldName || /.*?/ } },
    { $sort: { 'fields.weight': -1 } },
    { $group: { _id: '$author_permlink', fields: { $push: '$fields.body' } } },
    { $project: { _id: 0, author_permlink: '$_id', fields: 1 } },
  ];
  if (fieldName === 'status') {
    pipeline[2].$match['fields.weight'] = { $gt: 0 };
  }
  try {
    const wobjects = await WObjectModel.aggregate(pipeline);

    return { wobjects };
  } catch (error) {
    return { error };
  }
};

const getField = async (author, permlink, authorPermlink) => {
  try {
    const [field] = await WObjectModel.aggregate([
      { $match: { author_permlink: authorPermlink || /.*?/ } },
      { $unwind: '$fields' },
      { $match: { 'fields.author': author || /.*?/, 'fields.permlink': permlink } },
      { $replaceRoot: { newRoot: '$fields' } },
    ]);

    return { field };
  } catch (error) {
    return { error };
  }
};

const updateField = async (author, permlink, authorPermlink, key, value) => {
  try {
    const result = await WObjectModel.updateOne(
      { author_permlink: authorPermlink, 'fields.author': author, 'fields.permlink': permlink },
      { $set: { [`fields.$.${key}`]: value } },
    );
    return { result: result.nModified === 1 };
  } catch (e) {
    return { error: e };
  }
};

const getOne = async ({ author_permlink: authorPermlink }) => {
  try {
    const wobject = await WObjectModel.findOne({ author_permlink: authorPermlink }).lean();

    if (!wobject) {
      return { error: { status: 404, message: 'Wobject not found!' } };
    }
    return { wobject };
  } catch (e) {
    return { error: e };
  }
};

const pushNewPost = async ({ author_permlink: authorPermlink, post_id: postId }) => {
  try {
    const result = await WObjectModel.updateOne({ author_permlink: authorPermlink }, {
      $push: {
        latest_posts: {
          $each: [postId],
          $position: 0,
          $slice: WOBJECT_LATEST_POSTS_COUNT,
        },
      },
      $inc: { count_posts: 1, last_posts_count: 1 },
    });
    return { result: result.nModified === 1 };
  } catch (e) {
    return { error: e };
  }
};

module.exports = {
  getOne,
  create,
  update,
  addField,
  increaseFieldWeight,
  increaseWobjectWeight,
  removeVote,
  addVote,
  getWobjectsRefs,
  getFieldsRefs,
  getSomeFields,
  getField,
  updateField,
  pushNewPost,
};
