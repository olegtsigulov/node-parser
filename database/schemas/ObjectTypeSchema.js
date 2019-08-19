const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const ObjectTypeSchema = new Schema( {
    name: { type: String, required: true },
    author: { type: String, require: true },
    permlink: { type: String, require: true },
    weight: { type: Number, default: 0 } // value in STEEM(or WVIO) as a sum of rewards, index for quick sort
},
{
    toObject: { virtuals: true }, timestamps: true
} );

ObjectTypeSchema.index( { author: 1, permlink: 1 }, { unique: true } );
ObjectTypeSchema.index( { name: 1 }, { unique: true } );

const ObjectTypeModel = mongoose.model( 'ObjectType', ObjectTypeSchema );

module.exports = ObjectTypeModel;
