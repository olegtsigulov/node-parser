const { postRefsClient, lastBlockClient } = require('utilities/redis/redis');

const PARSE_ONLY_VOTES = process.env.PARSE_ONLY_VOTES === 'true';

const getHashAll = async (key, client = postRefsClient) => client.hgetallAsync(key);

const getLastBlockNum = async (key) => {
  if (!key) {
    key = PARSE_ONLY_VOTES ? 'last_vote_block_num' : 'last_block_num';
  }

  const num = await lastBlockClient.getAsync(key);

  return num ? parseInt(num, 10) : process.env.START_FROM_BLOCK || 29937113;
};

module.exports = { getHashAll, getLastBlockNum };
