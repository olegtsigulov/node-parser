const { expect, sinon, chai, getRandomString, faker } = require( '../../testHelper' );
const axios = require( 'axios' );
const votesOperations = require( '../../../utilities/restOperations/votes' );
const { UserFactory } = require( '../../factories' );
const app = require( '../../../app' );

describe( 'Vote Controller', async () => {
    describe( 'POST /addPostVote', async () => {
        let mockVote, mockVoter, validToken;
        beforeEach( async () => {
            mockVoter = ( await UserFactory.Create() ).user;
            validToken = getRandomString( 20 );
            mockVote = {
                voter: mockVoter.name,
                author: faker.name.firstName(),
                permlink: getRandomString( 10 ),
                weight: faker.random.number( { min: -10000, max: -10000 } )
            };
        } );
        describe( 'on valid input', async () => {
            let validateTokenRequestStub, requestResult, addPostVoteOpStub;
            beforeEach( async () => {
                validateTokenRequestStub = sinon.stub( axios, 'post' ).returns( { data: { user: mockVoter } } );
                addPostVoteOpStub = sinon.stub( votesOperations, 'addPostVote' ).returns( { result: { ok: 1 } } );
                requestResult = await chai.request( app ).post( '/waivio-node-parser/addPostVote' )
                    .set( 'access-token', validToken ).set( 'waivio-auth', '1' ).send( mockVote );
            } );
            afterEach( async () => {
                validateTokenRequestStub.restore();
                addPostVoteOpStub.restore();
            } );
            it( 'should return status 200', ( ) => {
                expect( requestResult ).to.have.status( 200 );
            } );
            it( 'should return body', () => {
                expect( requestResult.body ).to.exist;
            } );
            it( 'should call addPostVote operation once', () => {
                expect( addPostVoteOpStub ).to.be.calledOnce;
            } );
        } );

    } );

    describe( 'POST /addFieldVote', async () => {
        let mockVote, mockVoter, validToken;
        beforeEach( async () => {
            mockVoter = ( await UserFactory.Create() ).user;
            validToken = getRandomString( 20 );
            mockVote = {
                voter: mockVoter.name,
                author: faker.name.firstName(),
                permlink: getRandomString( 10 ),
                weight: faker.random.number( { min: -10000, max: -10000 } )
            };
        } );
        describe( 'on valid input', async () => {
            let validateTokenRequestStub, requestResult, addFieldVoteOpStub;
            beforeEach( async () => {
                validateTokenRequestStub = sinon.stub( axios, 'post' ).returns( { data: { user: mockVoter } } );
                addFieldVoteOpStub = sinon.stub( votesOperations, 'addFieldVote' ).returns( { result: { ok: 1 } } );
                requestResult = await chai.request( app ).post( '/waivio-node-parser/addFieldVote' )
                    .set( 'access-token', validToken ).set( 'waivio-auth', '1' ).send( mockVote );
            } );
            afterEach( async () => {
                validateTokenRequestStub.restore();
                addFieldVoteOpStub.restore();
            } );
            it( 'should return status 200', ( ) => {
                expect( requestResult ).to.have.status( 200 );
            } );
            it( 'should return body', () => {
                expect( requestResult.body ).to.exist;
            } );
            it( 'should call addPostVote operation once', () => {
                expect( addFieldVoteOpStub ).to.be.calledOnce;
            } );
        } );

    } );

} );
