const { PostFactory, ObjectTypeFactory } = require('../../factories');
const { faker } = require('../../testHelper');

const getCreateObjectTypeMocks = (app) => {
  const metadataWobj = {
    wobj: {
      action: 'createObjectType',
      name: faker.address.city().toLowerCase(),
    },
  };
  const op = PostFactory.Create({
    parent_author: '', additionsForMetadata: metadataWobj, onlyData: true, app,
  });

  return op;
};

const getCreateObjectMocks = async () => {
  const objectType = await ObjectTypeFactory.Create();
  const metadataWobj = {
    app: 'waiviotest',
    community: 'waiviodev',
    wobj: {
      creator: faker.name.firstName().toLowerCase(),
      action: 'createObject',
      is_posting_open: true,
      is_extending_open: true,
      default_name: faker.address.city(),
    },
  };
  const op = await PostFactory.Create({ parent_permlink: objectType.permlink, additionsForMetadata: metadataWobj, onlyData: true });

  return { ...op, parent_author: objectType.author };
};

module.exports = { getCreateObjectTypeMocks, getCreateObjectMocks };
