const mongoose = require('mongoose');

const { Schema } = mongoose;
const { LANGUAGES } = require('../../utilities/constants');

const UserMetadataSchema = new Schema({
  notifications_last_timestamp: { type: Number, default: 0 },
  settings: {
    // Enable this option to use the exit page when clicking on an external link.
    exitPageSetting: { type: Boolean, default: false },
    locale: { type: String, enum: [...LANGUAGES], default: 'auto' }, // which language use on waivio
    // in which language do you want read posts
    postLocales: { type: [{ type: String, enum: [...LANGUAGES] }], default: [] },
    nightmode: { type: Boolean, default: false }, // toggle nightmode on UI
    rewardSetting: { type: String, enum: ['SP', '50', 'STEEM'], default: '50' }, // in which format get rewards from posts
    rewriteLinks: { type: Boolean, default: false }, // change links from steemit.com to waivio.com
    showNSFWPosts: { type: Boolean, default: false }, // show or hide NSFW posts
    upvoteSetting: { type: Boolean, default: false }, // enable auto like on your posts
    votePercent: {
      type: Number, min: 1, max: 10000, default: 5000,
    }, // default percent of your upvotes
    votingPower: { type: Boolean, default: false }, // dynamic toggle of vote power on each vote
  },
  bookmarks: { type: [String], default: [] },
  drafts: {
    type: [{
      title: { type: String },
      author: { type: String },
      beneficiary: { type: Boolean, default: true },
      body: { type: String },
      jsonMetadata: { type: Object },
      lastUpdated: { type: Number },
      parentAuthor: { type: String },
      parentPermlink: { type: String },
      permlink: { type: String },
      reward: { type: String },
    }],
    default: [],
  },
});
const UserSchema = new Schema({
  name: {
    type: String, index: true, unique: true, required: true,
  },
  alias: { type: String },
  profile_image: { type: String },
  // arr of author_permlink of objects what user following
  objects_follow: { type: [String], default: [] },
  users_follow: { type: [String], default: [] }, // arr of users which user follow
  json_metadata: { type: String, default: '' },
  wobjects_weight: { type: Number, default: 0 }, // sum of weight of all wobjects
  count_posts: { type: Number, default: 0, index: true }, // count of the all posts
  last_posts_count: { type: Number, default: 0 }, // count of the posts written in last day
  last_posts_counts_by_hours: { type: [Number], default: [] },
  user_metadata: { type: UserMetadataSchema, default: () => ({}), select: false },
  last_root_post: { type: String, default: null },
  followers_count: { type: Number, default: 0 },
  stage_version: { type: Number, default: 0, required: true },
}, { timestamps: true });

UserSchema.index({ wobjects_weight: -1 });

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
