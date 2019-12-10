const { api } = require( '../api' );
const _ = require( 'lodash' );
const { restoreRedisHelper } = require( '../utilities/redis' );
const START_FROM_CURRENT = process.env.START_FROM_CURRENT === 'true';
const RESTORE_REDIS = process.env.RESTORE_REDIS === 'true';

const runStream = async () => {
    try {
        console.log( `RESTORE_REDIS: ${ RESTORE_REDIS}` );
        if( RESTORE_REDIS ) {
            const result = await restoreRedisHelper.restore();

            if ( result ) {
                console.log( `Restored ${result.fieldsCount} fields in ${result.wobjectsCount} wobjects and ${result.postsCount} posts with wobjects.` );
            }
        }
        console.log( `START_FROM_CURRENT: ${ START_FROM_CURRENT}` );

        const transactionStatus = await api.getBlockNumberStream( {
            // # param to start parse data from latest block in blockchain
            // # if set to "false" - parsing started from last_block_num(key in redis)
            startFromCurrent: START_FROM_CURRENT
        } );

        if ( !transactionStatus ) {
            console.log( 'Data is incorrect or stream is already started!' );
        } else {
            console.log( 'Stream started!' );
        }
    } catch ( e ) {
        console.error( e );
    }
};

module.exports = {
    runStream
};
