const Joi = require( '@hapi/joi' );

exports.addPostVote = Joi.object( {
    voter: Joi.string().invalid( '' ).required(),
    author: Joi.string().invalid( '' ).required(),
    permlink: Joi.string().invalid( '' ).required()
} );

exports.addFieldVote = Joi.object( {
    voter: Joi.string().invalid( '' ).required(),
    author: Joi.string().invalid( '' ).required(),
    permlink: Joi.string().invalid( '' ).required()
} );
