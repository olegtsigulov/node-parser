const { App } = require( '../database' ).models;

const getOne = async ( { name } ) => {
    try {
        const app = await App.findOne( { name } ).lean();

        if ( !app ) return { error: { message: 'App not found!' } };
        return { app };
    } catch ( error ) {
        return { error };
    }
};

module.exports = { getOne };