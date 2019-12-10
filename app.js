const express = require( 'express' );
const logger = require( 'morgan' );
const { routes } = require( './routes' );
const { runStream } = require( './processor/processor' );
const jobs = require( './utilities/jobs' );
const { createNamespace } = require( 'cls-hooked' );
const session = createNamespace( 'request-session' );
const app = express();

app.use( logger( 'dev' ) );
app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use( ( req, res, next ) => session.run( () => next() ) );

// write to store user steemconnect/waivioAuth access_token if it exist
app.use( ( req, res, next ) => {
    session.set( 'access-token', req.headers[ 'access-token' ] );
    session.set( 'isWaivioAuth', Boolean( req.headers[ 'waivio-auth' ] ) );
    next();
} );
app.use( '/', routes );
app.use( ( req, res, next ) => {
    res.header( 'Access-Control-Allow-Origin', '*' );
    res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' );
    next();
} );

// Last middleware which send data from "res.result.json" to client
app.use( ( req, res, next ) => {
    res.status( res.result.status || 200 ).json( res.result.json );
} );

// error handler
app.use( ( err, req, res, next ) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get( 'env' ) === 'development' ? err : {};
    // render the error page
    res.status( err.status || 500 ).json( { message: err.message } );
} );

runStream().catch( ( err ) => {
    console.log( err );
    process.exit( 1 );
} );

module.exports = app;
