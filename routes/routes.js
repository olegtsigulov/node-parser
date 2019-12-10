const { voteController } = require( '../controllers' );
const express = require( 'express' );
const routes = express.Router();

routes.use( '/waivio-node-parser', routes );

routes.route( '/addPostVote' ).post( voteController.addPostVote );
routes.route( '/addFieldVote' ).post( voteController.addFieldVote );

module.exports = routes;
