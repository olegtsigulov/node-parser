const userParsers = require( '../../parsers/userParsers' );
const followObjectParser = require( '../../parsers/followObjectParser' );
const voteParser = require( '../../parsers/voteParser' );
const postWithObjectParser = require( '../../parsers/postWithObjectParser' );
const { validateProxyBot, getFromMetadataGuestInfo } = require( './guestHelpers' );
const { votePostHelper, voteFieldHelper } = require( '../../utilities/helpers' );
const { Post, User, CommentModel } = require( '../../models' );
const { postsUtil } = require( '../steemApi' );
const _ = require( 'lodash' );

exports.followUser = async ( operation ) => {
    if ( validateProxyBot( _.get( operation, 'required_posting_auths[0]', _.get( operation, 'required_auths[0]' ) ) ) ) {
        const json = parseJson( operation.json );
        if ( !json ) return;

        operation.required_posting_auths = [ _.get( json, '[1].follower' ) ];
        await userParsers.followUserParser( operation );
    }
};

exports.reblogPost = async ( operation ) => {
    if ( validateProxyBot( _.get( operation, 'required_posting_auths[0]', _.get( operation, 'required_auths[0]' ) ) ) ) {
        const json = parseJson( operation.json );
        if ( !json ) return;

        operation.required_posting_auths = [ _.get( json, '[1].account' ) ];
        await userParsers.followUserParser( operation );
    }
};

exports.followWobject = async ( operation ) => {
    if ( validateProxyBot( _.get( operation, 'required_posting_auths[0]', _.get( operation, 'required_auths[0]' ) ) ) ) {
        const json = parseJson( operation.json );
        if ( !json ) return;

        operation.required_posting_auths = [ _.get( json, '[1].user' ) ];
        await followObjectParser.parse( operation );
    }
};

exports.guestVote = async ( operation ) => {
    if ( validateProxyBot( _.get( operation, 'required_posting_auths[0]', _.get( operation, 'required_auths[0]' ) ) ) ) {
        const json = parseJson( operation.json );
        if ( !json ) return;

        const [ vote ] = await voteParser.votesFormat( [ json ] );
        if ( vote.type === 'post_with_wobj' || !vote.type ) {
            await voteOnPost( { vote } );
        } else if ( vote.type === 'append_wobj' ) {
            await voteOnField( { vote } );
        }
    }
};

exports.accountUpdate = async ( operation ) => {
    if ( validateProxyBot( _.get( operation, 'required_posting_auths[0]', _.get( operation, 'required_auths[0]' ) ) ) ) {
        const json = parseJson( operation.json );
        if ( !json ) return;
        await userParsers.updateAccountParser( json );
    }
};

exports.guestCreate = async ( operation ) => {
    if ( validateProxyBot( _.get( operation, 'required_posting_auths[0]', _.get( operation, 'required_auths[0]' ) ) ) ) {
        const json = parseJson( operation.json );
        if ( !json ) return;
        if ( !json.userId || !json.displayName || !json.json_metadata ) return;
        const { error: crError } = await User.checkAndCreate( json.userId );
        if ( crError ) {
            console.error( crError );
            return;
        }
        const { error: updError } = await User.updateOne(
            { name: json.userId },
            { json_metadata: json.json_metadata, alias: json.displayName }
        );
        if ( updError ) {
            console.error( updError );
            return;
        }
        console.log( `Guest user ${json.userId} updated!` );
    }
};

// /////////////// //
// Private methods //
// /////////////// //
/**
 * Vote on post/comment(not on "wobject field").
 * Find post in DB and call voteOnPost helper.
 * If post in db not found --> call "findOrCreatePost", which find post/comment, create in DB and return.
 * If post actually is 'comment', just call 'CommentModel.addVote'
 * @param vote
 * @returns {Promise<{error: *}|{result: *}|undefined>}
 */
const voteOnPost = async ( { vote } ) => {
    let { post: existPost, error } = await Post.findOne( { root_author: vote.author, permlink: vote.permlink } );
    if ( error ) return;

    let post, comment;
    if ( !existPost ) {
        const { err, post: dbPost, comment: dbComment } = await findOrCreatePost( _.pick( vote, [ 'author', 'permlink' ] ) );
        if ( err ) {
            console.error( `Failed on vote from guest user: ${vote.voter}!` );
            return{ err };
        }
        if( dbPost ) post = dbPost;
        else if( dbComment ) comment = dbComment;
    } else {
        post = existPost;
    }
    if( post ) {
        _.remove( post.active_votes, ( v ) => v.voter === vote.voter );
        post.active_votes.push( { voter: vote.voter, percent: vote.weight, rshares: 1 } );

        let metadata;
        if ( post.json_metadata !== '' ) {
            metadata = parseJson( post.json_metadata );
            if ( !_.get( metadata, 'wobj' ) ) metadata.wobj = { wobjects: vote.wobjects };
        }

        return await votePostHelper.voteOnPost( {
            post,
            metadata,
            percent: vote.weight,
            ..._.pick( vote, [ 'wobjects', 'author', 'permlink', 'voter' ] )
        } );
    } else if ( comment ) {
        // add to existing comment one new vote
        const { result, error: addVoteError } = await CommentModel.addVote( { ..._.pick( vote, [ 'author', 'permlink', 'voter', 'weight' ] ) } );
        if( addVoteError ) {
            console.error( addVoteError );
            return{ error: addVoteError };
        }
        if( result.ok ) console.log( `User ${vote.voter} vote for comment @${vote.author}/${vote.permlink}` );
        return { result };
    }

};

const voteOnField = async ( { vote } ) => {
    await voteFieldHelper.voteOnField( {
        author: vote.author,
        permlink: vote.permlink,
        voter: vote.voter,
        author_permlink: vote.root_wobj,
        percent: vote.weight,
        weight: 0,
        rshares_weight: 0
    } );
};

const parseJson = ( json ) => {
    try {
        return JSON.parse( json );
    } catch ( error ) {
        console.error( error );
    }
};

/**
 * Save post/comment in DB if it wasn't exist before and return
 * @param data {Object} author, permlink
 * @returns {Promise<{err: *}|{newPost: ({post: *}|{error: *})}|{err: string}|{newComment: *}>}
 */
const findOrCreatePost = async ( { author, permlink } ) => {
    const { post, err } = await postsUtil.getPost( author, permlink );
    if( err ) return { err };
    if ( !post || !post.author ) {
        const errorMessage = `Trying vote on not existing post in steem: @${author}/${permlink}`;
        console.error( errorMessage );
        return { err: errorMessage };
    }
    // if comment not empty and without parent_author -> it's POST
    if( post.parent_author === '' ) {
        const { post: dbPost, error: findPostError } = await Post.findOne( { root_author: author, permlink } );
        if( dbPost ) return{ post: dbPost };

        const { post: newPost, error: parsePostError } = await postWithObjectParser
            .parse( { author, permlink }, parseJson( post.json_metadata ) );

        if ( parsePostError ) return { err: parsePostError };
        return { post: newPost };
    }
    // else, it's -> COMMENT
    const { comment: dbComment, error: findCommentError } = await CommentModel.getOne( { author, permlink } );
    if( dbComment ) return{ comment: dbComment };

    const comment = { ...post };
    comment.active_votes = [];
    comment.guestInfo = getFromMetadataGuestInfo( { operation: comment, metadata: parseJson( comment.json_metadata ) } );

    const { comment: newComment, error } = await CommentModel.createOrUpdate( comment );
    if( error ) return { err: error };
    return{ comment: newComment };
};
