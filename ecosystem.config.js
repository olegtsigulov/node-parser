
module.exports = {
    apps : [{
        name: 'waivio-node-parser-votes',
        script: './bin/service.js',

        instances: 1,
        watch: false,
        max_memory_restart: '2G',
        env: {
            PORT: '8094',
            NODE_PATH: '.',
            RESTORE_REDIS: 'false',
            START_FROM_CURRENT: 'false',
            PARSE_ONLY_VOTES: 'true'
        },
    }],
};

