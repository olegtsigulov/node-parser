const { expect, UserModel, User, getRandomString, dropDatabase, faker, UserWobjects } = require( '../../testHelper' );
const { UserFactory, ObjectFactory, userWobjectFactory } = require( '../../factories' );

describe( 'User Model', async () => {
    describe( 'On increaseWobjectWeight', async () => {
        let data, userBeforeIncrease, weightIncrease, name, userAfterIncrease, result;
        beforeEach( async() => {
            await dropDatabase();
            name = getRandomString();
            await UserFactory.Create( { name: name, wobjects_weight: 300 } );
            data = {
                name: name,
                author: getRandomString(),
                author_permlink: getRandomString(),
                weight: 50
            };
            userBeforeIncrease = await User.findOne( { name: name } );
        } );
        it( 'should return true with valid params', async () => {
            weightIncrease = await UserModel.increaseWobjectWeight( data );
            expect( weightIncrease.result ).is.true;
        } );
        it( 'should increase weight by data weight', async () => {
            weightIncrease = await UserModel.increaseWobjectWeight( data );
            userAfterIncrease = await User.findOne( { name: name } );
            expect( userAfterIncrease.wobjects_weight - userBeforeIncrease.wobjects_weight ).is.eq( data.weight );
        } );
        it( 'should create userWobject', async () => {
            weightIncrease = await UserModel.increaseWobjectWeight( data );
            result = await UserWobjects.findOne( { user_name: data.name } );
            expect( result ).is.exist;
        } );
        it( 'should create userWobject with data weight', async () => {
            weightIncrease = await UserModel.increaseWobjectWeight( data );
            result = await UserWobjects.findOne( { user_name: data.name } );
            expect( result.weight ).is.eq( data.weight );
        } );
        it( 'should get error without data', async() => {
            result = await UserModel.increaseWobjectWeight();
            expect( result.error ).is.exist;
        } );
        it( 'should get error with incorrect data', async () => {
            result = await UserModel.increaseWobjectWeight( { data: { some: getRandomString() } } );
            expect( result.error ).is.exist;
        } );
        it( 'should create new user if it not exist', async () => {
            data.name = getRandomString();
            weightIncrease = await UserModel.increaseWobjectWeight( data );
            result = await User.findOne( { name: data.name } );
            expect( result ).is.not.null;
        } );
    } );
    describe( 'On checkForObjectShares', async () => {
        let data, weight, result;
        beforeEach( async () => {
            weight = faker.random.number();
            data = {
                name: faker.name.firstName(),
                author_permlink: getRandomString( 10 )
            };
            await userWobjectFactory.Create( { user_name: data.name, author_permlink: data.author_permlink, weight: weight } );
        } );

        it( 'should return correct weight', async () => {
            result = await UserModel.checkForObjectShares( data );
            expect( result.weight ).to.eq( weight );
        } );
        it( 'should return error with incorrect input data', async () => {
            result = await UserModel.checkForObjectShares( { name: faker.name.firstName(), author_permlink: getRandomString() } );
            expect( result.error ).is.exist;
        } );
        it( 'should return error without input data', async () => {
            result = await UserModel.checkForObjectShares( );
            expect( result.error ).is.exist;
        } );

    } );
    describe( 'On addUserFollow', async () => {
        let follower, following, upd_follower;
        beforeEach( async() => {
            follower = await UserFactory.Create( );
            following = await UserFactory.Create( );
            await UserModel.addUserFollow( { follower: follower.user.name, following: following.user.name } );
            upd_follower = await User.findOne( { name: follower.user.name } );
        } );
        it( 'should users_follow contains following name', async () => {
            expect( upd_follower._doc.users_follow ).to.contain( following.user.name );
        } );
        it( 'should check users_follow contains only one and correct user', async () => {
            expect( upd_follower.users_follow ).to.deep.eq( [ following.user.name ] );
        } );
        it( 'should return error with incorrect data', async () => {
            upd_follower = await UserModel.addUserFollow( { follower: { user: getRandomString() }, following: following } );
            expect( upd_follower.error ).is.exist;
        } );
    } );
    describe( 'On removeUserFollow', async () => {
        let follower, following;
        beforeEach( async () => {
            await dropDatabase();
            following = [ faker.name.firstName() ];
            follower = await UserFactory.Create( { users_follow: following } );
        } );
        it( 'should users_follow length bigger then 0', async () => {
            expect( follower.user.users_follow.length > 0 ).is.true;
        } );
        it( 'should user_follow removed successfully', async () => {
            await UserModel.removeUserFollow( { follower: follower.user.name, following: following[ 0 ] } );
            const result = await User.findOne( { name: follower.user.name } );
            expect( result._doc.users_follow ).to.not.contain( following[ 0 ] );
        } );
        it( 'should user_follow is empty', async () => {
            await UserModel.removeUserFollow( { follower: follower.user.name, following: following[ 0 ] } );
            const result = await User.findOne( { name: follower.user.name } );
            expect( result._doc.users_follow ).is.empty;
        } );
        it( 'should get error with incorrect following', async () => {
            const result = await UserModel.removeUserFollow( { follower: follower.user.name, following: following } );
            expect( result.error ).is.exist;
        } );
        it( 'should get error with incorrect data', async () => {
            const result = await UserModel.removeUserFollow( { follower: { user: getRandomString() }, following: following } );
            expect( result.error ).is.exist;
        } );
    } );
    describe( 'On addObjectFollow', async () => {
        let mockObject, result, mockUser;
        beforeEach( async () => {
            mockUser = await UserFactory.Create();
            mockObject = await ObjectFactory.Create();
            await UserModel.addObjectFollow( {
                user: mockUser.user.name,
                author_permlink: mockObject.author_permlink
            } );
            result = await User.findOne( { name: mockUser.user.name } );
        } );
        it( 'should follower object_follow is not empty', async () => {
            expect( result._doc.objects_follow ).not.empty;
        } );
        it( 'object_follow list contains mockObject', async () => {
            expect( result._doc.objects_follow ).to.contain( mockObject.author_permlink );
        } );
        it( 'should check that array objects_follow contains only one wobject', async () => {
            expect( result.objects_follow ).to.deep.eq( [ mockObject.author_permlink ] );
        } );
        it( 'should get error with incorrect data', async () => {
            result = await UserModel.addObjectFollow( { some: { test: { data: getRandomString() } } } );
            expect( result.error ).is.exist;
        } );
        it( 'shouldn\'t get error without author_permlink', async () => {
            result = await UserModel.addObjectFollow( { user: getRandomString() } );
            expect( result.error ).is.not.exist;
        } );
    } );
    describe( 'On removeObjectFollow ', async () => {
        let mockObject, result, follower;
        beforeEach( async () => {
            mockObject = [ getRandomString() ];
            follower = await UserFactory.Create( { objects_follow: mockObject } );
        } );
        it( 'should object_follow contains fakeObject', async () => {
            result = await User.findOne( { name: follower.user.name } );
            expect( result._doc.objects_follow ).not.empty;
        } );
        it( 'should remove objects_follow successfully', async () => {
            await UserModel.removeObjectFollow( { user: follower.user.name, author_permlink: mockObject[ 0 ] } );
            result = await User.findOne( { name: follower.user.name } );
            expect( result._doc.objects_follow ).to.not.contain( mockObject[ 0 ] );
        } );
        it( 'should get error without data', async () => {
            result = await UserModel.removeObjectFollow();
            expect( result.error ).is.exist;
        } );
        it( 'should delete only one wobject from objects_follow', async () => {
            mockObject = [ getRandomString(), getRandomString() ];
            follower = await UserFactory.Create( { objects_follow: mockObject } );
            await UserModel.removeObjectFollow( { user: follower.user.name, author_permlink: mockObject[ 0 ] } );
            result = await User.findOne( { name: follower.user.name } );
            expect( result.objects_follow ).not.empty;
            expect( result.objects_follow ).not.contains( mockObject[ 0 ] );
        } );
    } );
    describe( 'On create', async () => {
        let user, data;
        beforeEach( async () => {
            data = {
                name: getRandomString()
            };
            user = await UserModel.create( data );
        } );
        it( 'should created user is exist', async () => {
            expect( user.user ).is.exist;
        } );
        it( 'should user name and data name are same', async () => {
            expect( data.name ).to.eq( user.user.name );
        } );
        it( 'should get error with incorrect data', async () => {
            let result = await UserModel.create( { name: { some: getRandomString() } }, { alias: { some: getRandomString() } } );
            expect( result.error ).exist;
        } );
        it( 'should get validation error', async () => {
            let result = await UserModel.create( { name: { some: getRandomString() } }, { alias: { some: getRandomString() } } );
            expect( result.error.name ).to.eq( 'ValidationError' );
        } );
    } );
    describe( 'On update', async () => {
        let firstUser, secondUser, updateData, condition, updatedUser, updatedUser2, result;
        beforeEach( async () => {
            secondUser = await UserFactory.Create();
            firstUser = await UserFactory.Create();

            condition = {
                count_posts: 0
            };
            updateData = {
                $set: {
                    wobjects_weight: 1111
                }
            };
            result = await UserModel.update( condition, updateData );
            updatedUser = await User.findOne( { name: firstUser.user.name } );
            updatedUser2 = await User.findOne( { name: secondUser.user.name } );
        } );
        it( 'should result ok is 1', async () => {
            expect( result.result.ok ).to.eq( 1 );
        } );
        it( 'should update user successfully', async () => {
            expect( firstUser.user.wobjects_weight ).to.not.eq( updatedUser._doc.wobjects_weight );
        } );
        it( 'should update second user successfully', async () => {
            expect( secondUser.user.wobjects_weight ).to.not.eq( updatedUser2._doc.wobjects_weight );
        } );
        it( 'should get error with incorrect data', async () => {
            let res = await UserModel.update( 55, { get: { data: getRandomString() } } );
            expect( res.error ).exist;
        } );
        it( 'should get object parameter error', async () => {
            let res = await UserModel.update( 55, { get: { data: getRandomString() } } );
            expect( res.error.name ).to.eq( 'ObjectParameterError' );
        } );
        it( 'should check that the fields which was update are the same ', async () => {
            expect( updatedUser.wobjects_weight ).is.eq( updatedUser2.wobjects_weight );
        } );
    } );
    describe( 'On updateOne', async () => {
        let firstUser, updateData, condition, updatedUser;
        beforeEach( async() => {
            firstUser = await UserFactory.Create();
            updateData = {
                wobjects_weight: 100
            };
            condition = {
                name: firstUser.user.name
            };
            await UserModel.updateOne( condition, updateData );
            updatedUser = await User.findOne( { name: firstUser.user.name } );
        } );
        it( 'should update user successfully', async () => {
            expect( firstUser.user.wobjects_weight ).to.not.eq( updatedUser._doc.wobjects_weight );
        } );
        it( 'should update user by updateData', async () => {
            expect( updatedUser._doc.wobjects_weight ).to.eq( updateData.wobjects_weight );
        } );
        it( 'should get error ', async () => {
            let res = await UserModel.updateOne( 55, { get: { data: getRandomString() } } );
            expect( res.error ).exist;
        } );
        it( 'should get object parameter error', async () => {
            let res = await UserModel.updateOne( 55, { get: { data: getRandomString() } } );
            expect( res.error.name ).to.eq( 'ObjectParameterError' );
        } );
    } );
    describe( 'On checkAndCreate', async () => {
        let user, foundedUser, name, result;
        beforeEach( async () => {
            name = getRandomString();
            user = await UserFactory.Create( { name: name } );
        } );
        it( 'should return user', async () => {
            let checkedExistUser = await UserModel.checkAndCreate( name );
            expect( user.user._id ).to.deep.eq( checkedExistUser.user._id );
        } );
        it( 'should create new user if user not exist', async () => {
            name = getRandomString();
            const findUser = await User.findOne( { name: name } );
            await UserModel.checkAndCreate( name );
            foundedUser = await User.findOne( { name: name } );
            expect( !findUser && foundedUser.name === name ).is.true;
        } );
        it( 'should check that created user has needed name', async () => {
            await UserModel.checkAndCreate( name );
            foundedUser = await User.findOne( { name: name } );
            expect( foundedUser.name ).to.eq( name );
        } );
        it( 'should return error with incorrect data', async () => {
            result = await UserModel.checkAndCreate( { some: { test: 'data' } } );
            expect( result.error ).is.exist;
        } );
        it( 'should get error without data', async () => {
            result = await UserModel.checkAndCreate( );
            expect( result.error ).to.eq( 'Name must be a string!' );
        } );
    } );
    describe( 'On increaseCountPosts', async () => {
        let author, result, updatedAuthor;
        beforeEach( async () => {
            author = await UserFactory.Create();
            result = await UserModel.increaseCountPosts( author.user.name );
            updatedAuthor = await User.findOne( { name: author.user.name } );
        } );
        it( 'should return result true', async () => {
            expect( result.result ).is.true;
        } );
        it( 'should update count posts', async () => {
            expect( author.user.count_posts ).to.not.eq( updatedAuthor._doc.count_posts );
        } );
        it( 'should success update count posts by 1', async () => {
            expect( author.user.count_posts + 1 ).to.eq( updatedAuthor._doc.count_posts );
        } );
        it( 'should get error with incorrect data', async () => {
            let res = await UserModel.increaseCountPosts( { author: { incorrect: getRandomString() } } );
            expect( res.error ).is.exist;
        } );
    } );
} );
