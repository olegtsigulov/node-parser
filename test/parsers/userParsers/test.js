const { userParsers, User, expect, faker } = require( '../../testHelper' );
const { UserFactory } = require( '../../factories' );

describe( 'UserParsers', async () => {
    describe( 'on updateAccountParse', async () => {
        let updUser;

        before( async () => {
            const { user: mockUser } = await UserFactory.Create();

            await userParsers.updateAccountParser( {
                account: mockUser.name,
                json_metadata: '{hello: world}'
            } );
            updUser = await User.findOne( { name: mockUser.name } ).lean();
        } );

        it( 'should update existing account', () => {
            expect( updUser ).to.include.key( 'json_metadata' );
        } );
        it( 'should update json_metadata correct', () => {
            expect( updUser.json_metadata ).to.equal( '{hello: world}' );
        } );
        it( 'should not create user if update was on non exist user', async () => {
            await userParsers.updateAccountParser( {
                account: 'nonexistuser',
                json_metadata: '{hello: world}'
            } );
            const user = await User.findOne( { name: 'nonexistuser' } );

            expect( user ).to.not.exist;
        } );
    } );

    describe( 'on followUserParser', async () => {
        let usr;
        let usr2;

        before( async () => {
            const { user } = await UserFactory.Create();
            const { user: user2 } = await UserFactory.Create();

            usr = user;
            usr2 = user2;
            await User.update( { name: user2.name }, { users_follow: [ 'tstusernamefllw' ] } );
            await userParsers.followUserParser( {
                json: JSON.stringify( [
                    'follow',
                    {
                        follower: user.name,
                        following: 'tstusernamefllw',
                        what: [ 'blog' ]
                    }
                ] )
            } );

            await userParsers.followUserParser( {
                json: JSON.stringify( [
                    'follow',
                    {
                        follower: user2.name,
                        following: 'tstusernamefllw',
                        what: []
                    }
                ] )
            } );
            // updUser = await User.findOne( { name: user.name } ).lean();
        } );
        it( 'should add user to follow list', async () => {
            let user = await User.findOne( { name: usr.name } ).lean();

            expect( user.users_follow ).to.include( 'tstusernamefllw' );
        } );
        it( 'should remove user from follow list', async () => {

        } );

    } );
} );
