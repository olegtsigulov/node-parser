const { UserFactory, ObjectFactory } = require( '../../factories' );
const { faker, getRandomString } = require( '../../testHelper' );

const dataForFollow = async ( { follow, error, userName, auth_permlink } = {} ) => {
    const author_permlink = auth_permlink || getRandomString( 10 );
    const name = userName || faker.name.firstName();
    if ( error ) getRandomString();
    await UserFactory.Create( name );
    await ObjectFactory.Create( { author_permlink: author_permlink } );
    if( follow ) {
        return {
            json: `["follow",{"user": "${name}","author_permlink": "${author_permlink}","what": [{"user": \"rtestser\","author_permlink": \"getRandomString\"}]}]`
        };
    }
    return {
        json: `["follow",{"user": "${name}","author_permlink": "${author_permlink}","what": []}]`
    };
};

module.exports = { dataForFollow };