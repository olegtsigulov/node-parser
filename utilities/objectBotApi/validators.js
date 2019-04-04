const _ = require('lodash');

const CREATE_OBJECT_TYPE_REQUIRED_FIELDS = 'objectType'.split(',');
const CREATE_OBJECT_REQUIRED_FIELDS = 'author,title,body,permlink,objectName,locale,isExtendingOpen,isPostingOpen,parentAuthor,parentPermlink'.split(',');
const APPEND_OBJECT_REQUIRED_FIELD = 'author,permlink,parentAuthor,parentPermlink,body,title,field'.split(',');

const createObjectTypeValidate = (data) => {
    for (const field in CREATE_OBJECT_TYPE_REQUIRED_FIELDS) {
        if (_.isNil(data[field])) {
            return {error: {message: `Create Object Type data is not valid, ${field} field not found!`}}
        }
    }
};

const createObjectValidate = (data) => {
    for (const field in CREATE_OBJECT_REQUIRED_FIELDS) {
        if (_.isNil(data[field])) {
            return {error: {message: `Create Object data is not valid, ${field} field not found!`}}
        }
    }
};

const appendObjectValidate = (data) => {
    for (const field in APPEND_OBJECT_REQUIRED_FIELD) {
        if (_.isNil(data[field])) {
            return {error: {message: `Append Object data is not valid, ${field} field not found!`}}
        }
    }
    const REQUIRED_FIELD_FIELDS = 'name,body,locale'.split(',');
    for (const field in REQUIRED_FIELD_FIELDS) {
        if (_.isNil(data.field[field])) {
            return {error: {message: `Append Object data is not valid, field.${field} field not found!`}}
        }
    }
};

module.exports = {
    createObjectTypeValidate,
    createObjectValidate,
    appendObjectValidate
}
