const axios = require( 'axios' );
const { IMPORT_OBJECTS_SERVICE_HOST_URL, IMPORT_UPDATES_ROUTE } = require( '../../constants/appData' ).objectImportService;
const URL = IMPORT_OBJECTS_SERVICE_HOST_URL + IMPORT_UPDATES_ROUTE;
const _ = require( 'lodash' );

const send = async ( wobjects ) => {
    if ( _.isArray( wobjects ) && !_.isEmpty( wobjects ) ) {
        try {
            const { data: response } = await axios.post( URL, { wobjects } );
            if ( response ) return { response };
            return { error: { message: 'Not enough response data!' } };
        } catch ( error ) {
            return { error };
        }
    }
};

module.exports = { send };
