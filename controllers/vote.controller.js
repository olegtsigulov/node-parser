const { validate, voteSchemas } = require( './validators' );
const votesOperations = require( '../utilities/restOperations/votes' );
const { authorise } = require( '../utilities/authorization/authoriseUser' );

exports.addPostVote = async function ( req, res, next ) {
    const value = validate( req.body, voteSchemas.addFieldPostVote, next );
    if( !value ) return;

    const { error: authError } = await authorise( value.voter );
    if( authError ) return next( authError );

    const { result, error } = await votesOperations.addPostVote( value );
    if ( error ) return next( error );

    res.result = { status: 200, json: { result } };
    return next();
};

exports.addFieldVote = async function ( req, res, next ) {
    const value = validate( req.body, voteSchemas.addFieldPostVote, next );
    if( !value ) return;

    const { error: authError } = await authorise( value.voter );
    if( authError ) return next( authError );

    const { result, error } = await votesOperations.addFieldVote( value );
    if ( error ) return next( error );

    res.result = { status: 200, json: { result } };
    next();
};
