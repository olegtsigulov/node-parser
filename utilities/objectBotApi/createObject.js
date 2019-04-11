const axios = require('axios');
const {OBJECT_BOT_HOST_URL, CREATE_OBJECT_ROUTE} = require('../../constants/appData').objectsBot;
const {createObjectValidate} = require('./validators');
const URL = OBJECT_BOT_HOST_URL + CREATE_OBJECT_ROUTE;

const send = async (data) => {
    const {error} = createObjectValidate(data);
    if (error) {
        console.error(error);
        return {error};
    }
    while(true){
        try {
            const {data: response} = await axios.post(URL, data);
            if (response && response.transactionId && response.parentAuthor && response.parentPermlink && response.author && response.permlink) {
                return {response};
            } else {
                return {error:{message: 'Not enough response data!'}}
            }
        } catch (err) {
            if(err.statusCode === 503){     //not enough mana or limit on creating post
                await new Promise(r=>setTimeout(r,1000));
                continue;
            } else {
                return {error: err};
            }
        }
    }

};

module.exports = {send};

