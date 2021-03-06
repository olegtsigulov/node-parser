const _ = require('lodash');
const {
  userParsers, User, expect, sinon, Post, faker, userHelper, dropDatabase,
} = require('test/testHelper');
const { UserFactory, PostFactory } = require('test/factories');
const { User: UserModel, Post: PostModel } = require('models');

describe('UserParsers', async () => {
  describe('on updateAccountParse', async () => {
    let updUser;
    const mockMetadata = {
      profile: {
        name: faker.name.firstName(),
        profile_image: faker.random.string(20),
      },
    };

    beforeEach(async () => {
      // await dropDatabase();
      const { user: mockUser } = await UserFactory.Create();

      await userParsers.updateAccountParser({
        account: mockUser.name,
        json_metadata: JSON.stringify(mockMetadata),
      });
      updUser = await User.findOne({ name: mockUser.name }).lean();
    });

    it('should update existing account', () => {
      expect(updUser).to.include.key('json_metadata');
    });
    it('should update json_metadata correct', () => {
      expect(updUser.json_metadata).to.equal(JSON.stringify(mockMetadata));
    });
    it('should update existing account and add alias key', () => {
      expect(updUser).to.include.key('alias');
    });
    it('should update alias name correct', () => {
      expect(updUser.alias).to.equal(mockMetadata.profile.name);
    });
    it('should update "profile_image" correct', () => {
      expect(updUser.profile_image).to.equal(mockMetadata.profile.profile_image);
    });
    it('shouldn\'t create user if update was on non exist user', async () => {
      await userParsers.updateAccountParser({
        account: 'nonexistuser',
        json_metadata: '{hello: world}',
      });
      const user = await User.findOne({ name: 'nonexistuser' });

      expect(user).to.not.exist;
    });
  });

  describe('on followUserParser', async () => {
    describe('on valid input data', async () => {
      let usr, usr2, following, unfollowing;

      beforeEach(async () => {
        await dropDatabase();
        following = (await UserFactory.Create()).user.name;
        unfollowing = (await UserFactory.Create()).user.name;
        await UserFactory.Create({ name: following });
        await UserFactory.Create({ name: unfollowing });

        usr = (await UserFactory.Create()).user;
        usr2 = (await UserFactory.Create({ users_follow: [unfollowing] })).user;

        await userParsers.followUserParser({
          required_posting_auths: [usr.name],
          json: JSON.stringify([
            'follow',
            {
              follower: usr.name,
              following,
              what: ['blog'],
            },
          ]),
        });
        await userParsers.followUserParser({
          required_posting_auths: [usr2.name],
          json: JSON.stringify([
            'follow',
            {
              follower: usr2.name,
              following: unfollowing,
              what: [],
            },
          ]),
        });
        await userParsers.followUserParser({
          required_posting_auths: [usr2.name],
          json: JSON.stringify([
            'follow',
            {
              follower: usr2.name,
              following: faker.name.firstName(),
              what: ['ignore'],
            },
          ]),
        });
      });
      it('should add user to follow list', async () => {
        const user = await User.findOne({ name: usr.name }).lean();
        expect(user.users_follow).to.include(following);
      });
      it('should increase follower counters at following user', async () => {
        const user = await User.findOne({ name: following }).lean();
        expect(user.followers_count).to.be.eq(1);
      });
      it('should decrease followers counters with unfollow operation ', async () => {
        const user = await User.findOne({ name: usr2.name }).lean();
        expect(user.followers_count).to.be.eq(0);
      });
      it('should remove user from follow list', async () => {
        const user = await User.findOne({ name: usr2.name }).lean();
        expect(user.users_follow).to.be.empty;
      });
    });

    describe('if first param in JSON is "reblog"', async () => {
      let mockJson,
        reblogParserStub,
        addUserFollowStub,
        removeUserFollowStub;
      beforeEach(async () => {
        reblogParserStub = sinon.stub(userParsers, 'reblogPostParser').returns(0);
        addUserFollowStub = sinon.stub(UserModel, 'addUserFollow').returns({});
        removeUserFollowStub = sinon.stub(UserModel, 'removeUserFollow').returns({});
        mockJson = ['reblog', {
          account: faker.name.firstName(),
          author: faker.name.firstName(),
          permlink: faker.random.string(15),
        }];
        await userParsers.followUserParser({
          json: JSON.stringify(mockJson),
          required_posting_auths: [mockJson[1].account],
        });
      });
      afterEach(() => {
        reblogParserStub.restore();
        addUserFollowStub.restore();
        removeUserFollowStub.restore();
      });

      it('should call "reblogPostParser" once', () => {
        expect(reblogParserStub).to.be.called;
      });

      it('should call "reblogPostParser" with correct params', () => {
        expect(reblogParserStub).to.be.calledWith({ json: mockJson, account: mockJson[1].account });
      });

      it('should not call addUserFollow on user model', () => {
        expect(addUserFollowStub).to.be.not.called;
      });

      it('should not call removeUserFollow on user model', () => {
        expect(removeUserFollowStub).to.be.not.called;
      });
    });
  });

  describe('on reblogPostParser', async () => {
    describe('on valid json', async () => {
      let post,
        user,
        reblogPost,
        updSourcePost,
        mockInput;
      beforeEach(async () => {
        sinon.stub(userHelper, 'checkAndCreateUser').returns({ user: 'its ok' });
        const { user: userMock } = await UserFactory.Create();
        user = userMock;
        post = await PostFactory.Create({
          reblogged: [user.name],
          additionsForPost: {
            wobjects: [
              { author_permlink: faker.random.string(10), percent: 50 },
              { author_permlink: faker.random.string(10), percent: 50 },
            ],
            language: 'ru-RU',
          },
        });
        mockInput = {
          json: ['reblog', { account: user.name, author: post.author, permlink: post.permlink }],
          account: user.name,
        };
        await userParsers.reblogPostParser(mockInput);
        updSourcePost = await Post.findOne({ author: post.author, permlink: post.permlink }).lean();
        reblogPost = await Post.findOne({
          author: user.name,
          permlink: `${post.author}/${post.permlink}`,
        }).lean();
      });
      afterEach(async () => {
        sinon.restore();
      });
      it('should create new post with field reblog_to not null', () => {
        expect(reblogPost.reblog_to).to.not.null;
      });
      it('should create new post with correct field reblog_to', () => {
        expect(reblogPost.reblog_to).to.deep.eq(_.pick(post, ['author', 'permlink']));
      });
      it('should not edit source post', async () => {
        expect(_.omit(post, 'updatedAt')).to.deep.eq(_.omit(updSourcePost, 'updatedAt'));
      });
      it('should duplicate all source post wobjects', () => {
        expect(reblogPost.wobjects).to.deep.eq(post.wobjects);
      });
      it('should duplicate source post language', () => {
        expect(reblogPost.language).to.eq(post.language);
      });
      it('should update source post field reblogged_users', async () => {
        expect(updSourcePost.reblogged_users).to.contain(user.name);
      });
    });
    describe('on invalid json', async () => {
      let user,
        mockInput;
      beforeEach(async () => {
        const { user: userMock } = await UserFactory.Create();
        user = userMock;
        mockInput = {
          json: ['reblog', {
            account: user.name,
            author: faker.random.string(10),
            permlink: faker.random.string(10),
          }],
          account: user.name,
        };
        sinon.spy(PostModel, 'create');
        sinon.spy(PostModel, 'update');
      });
      afterEach(async () => {
        sinon.restore();
      });
      it('should not call method create post with invalid input', async () => {
        await userParsers.reblogPostParser({});
        expect(PostModel.create).to.be.not.called;
      });
      it('should not call method update post with invalid input', async () => {
        await userParsers.reblogPostParser({});
        expect(PostModel.update).to.be.not.called;
      });
      it('should not create reblogged post if FindOne method throws error', async () => {
        sinon.stub(Post, 'findOne').throws({ message: faker.random.string(10) });
        await userParsers.reblogPostParser(mockInput);
        expect(PostModel.create).to.be.not.called;
      });
    });
  });
});
