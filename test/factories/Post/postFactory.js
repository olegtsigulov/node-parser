const {faker, getRandomString, Post} = require('../../testHelper');
const _ = require('lodash');

const Create = async ({additionsForMetadata = {}, onlyData, parent_author, parent_permlink, additionsForPost = {}} = {}) => {    //additionsForMetadata(Post) must be an Object
    const json_metadata = {
        community: 'waiviodev',
        app: 'waiviodev',
        tags: ['testtag1', 'testtag2']
    };
    for (const key in additionsForMetadata) {
        json_metadata[key] = additionsForMetadata[key];
    }
    const post = {
        parent_author: _.isNil(parent_author) ? faker.name.firstName().toLowerCase() : parent_author , //if it's post - parent_author not exists
        parent_permlink: _.isNil(parent_permlink) ? getRandomString(20)   : parent_permlink,
        author: faker.name.firstName().toLowerCase(),
        permlink: getRandomString(20),
        title: faker.address.city(),
        body: getRandomString(100),
        json_metadata: JSON.stringify(json_metadata),
        id: faker.random.number(10000)
    };
    for (const key in additionsForPost) {
        post[key] = additionsForPost[key]
    }
    if (onlyData) {   //return only post data, but not create into database
        return post
    }
    const new_post = await Post.create(post);
    return new_post;
};

module.exports = {Create}