const Joi = require( '@hapi/joi' );
/**
 * Schema for validation vote on Post or Field
 */
exports.addFieldPostVote = Joi.object( {
    voter: Joi.string().invalid( '' ).required(),
    author: Joi.string().invalid( '' ).required(),
    permlink: Joi.string().invalid( '' ).required(),
    weight: Joi.number().min( -10000 ).max( 10000 ).required()
} );

