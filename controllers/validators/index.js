module.exports = {
    voteSchemas: require( './vote.validator' ),
    validate: ( data, schema, next ) => {
        const result = schema.validate( data );
        if( result.error ) {
            return next( { status: 422, message: result.error.message } );
        }
        return result.value;
    }
};
