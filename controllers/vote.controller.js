const { validate, voteSchemas } = require( './validators' );
const { addPostVote, addFieldVote } = require( '../utilities/operations/votes' );
const { authorise } = require( '../utilities/authorization/authoriseUser' );

exports.addPostVote = async function ( req, res, next ) {
    const value = validate( req.body, voteSchemas.addPostVote, next );
    if( !value ) return;

    const { error: authError } = await authorise( value.voter );
    if( authError ) return next( authError );

    const { result, error } = await addPostVote( value );
    if ( error ) return next( error );

    res.result = { status: 200, json: { result } };
    return next();
};

exports.addFieldVote = async function ( req, res, next ) {
    const value = validate( req.body, voteSchemas.addFieldVote, next );
    if( !value ) return;

    const { error: authError } = await authorise( value.voter );
    if( authError ) return next( authError );

    const { result, error } = await addFieldVote( value );
    if ( error ) return next( error );

    res.result = { status: 200, json: { result } };
    next();
};
