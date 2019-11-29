const { WObject } = require( '../../../database' ).models;
const getComments = require( './getComments' );
const appendObjectParser = require( '../../../parsers/appendObjectParser' );
const fs = require( 'fs' );

const getWobjects = async () => {
    try{
        const result = await WObject.aggregate( [
            { $match: { fields: { $size: 0 } } },
            { $project: { author: 1, author_permlink: 1, _id: 0, default_name: 1 } }
        ] );
        return { result };
    }catch( error ) {
        return { error };
    }
};

const appendWobjectFields = async ( wobject ) => {
    const { result: comments, err } = await getComments( wobject.author, wobject.author_permlink );
    if ( err ) console.error( err );
    if ( !comments || !comments.length ) {
        console.log( `wobject, author: ${wobject.author}, permlink: ${wobject.author_permlink} has no comments with appends` );
        return true ;
    }
    for ( let comment of comments ) {
        if ( !comment.metadata.wobj ) continue;
        await appendObjectParser.parse( comment.operation, comment.metadata );
    }
};

const appendFields = async () => {
    const emptyWobjects = [];
    const { result: wobjWithoutFields } = await getWobjects();
    for ( let wobject of wobjWithoutFields ) {
        const result = await appendWobjectFields( wobject );
        if ( result ) {
            emptyWobjects.push( wobject );
        }
    }
    fs.writeFileSync( './utilities/tasks/resources/emptyWobjects.json', JSON.stringify( emptyWobjects ) );
    console.log( 'Successfully end' );
};

module.exports = { appendFields };

