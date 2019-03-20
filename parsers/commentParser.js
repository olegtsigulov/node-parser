const createObjectParser = require('./createObjectParser');
const appendObjectParser = require('./appendObjectParser');
const postWithObjectsParser = require('./postWithObjectParser');
const objectTypeParser = require('./objectTypeParser');
const {postByTagsHelper} = require('../utilities/helpers');
const _ = require('lodash');

const parse = async function (operation) {  //data is operation[1] of transaction in block
    let metadata;
    try {
        if (operation.json_metadata !== '') {
            metadata = JSON.parse(operation.json_metadata)          //parse json_metadata from string to JSON
        }
    } catch (e) {
        console.error(e)
    }
    if (operation.parent_author === '' && metadata) {   //comment without parent_author is POST
        if (metadata.wobj) {        //case if user add wobjects when create post
            if (_.get(metadata.wobj, 'action') === 'createObjectType') {
                await objectTypeParser.parse(operation, metadata);      //create new Object Type
            } else if (metadata.wobj.wobjects && Array.isArray(metadata.wobj.wobjects)) {
                if (metadata.tags) {
                    const tagWobjects = await postByTagsHelper.wobjectsByTags(metadata.tags);
                    if (tagWobjects && tagWobjects.length) {
                        metadata.wobj.wobjects = [...metadata.wobj.wobjects, ...tagWobjects];
                    }
                }
                await postWithObjectsParser.parse(operation, metadata);         //create post with wobjects in database
            }
        } else if (metadata.tags) { //case if post has wobjects from tags
            const wobjects = await postByTagsHelper.wobjectsByTags(metadata.tags);
            if (wobjects && wobjects.length) {
                metadata.wobj = {wobjects};
                await postWithObjectsParser.parse(operation, metadata);
            }
        }
    } else if (operation.parent_author && operation.parent_permlink) {  //comment with parent_author is REPLY TO POST
        if (metadata && metadata.wobj) {
            if (metadata.wobj.action) {
                switch (metadata.wobj.action) {
                    case 'createObject':
                        await createObjectParser.parse(operation, metadata);
                        break;
                    case 'appendObject':
                        await appendObjectParser.parse(operation, metadata);
                }
            }
        }
    }
};

module.exports = {parse};