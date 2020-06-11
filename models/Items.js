const mongoose = require('mongoose'); 

const ItemSchema = new mongoose.Schema({
    purchaseDate: {
        type: String,
        required: [true, 'Name Field is Required'] 
    },

    itemCode: {
        type: String, 
        required: true 
    },

    phoneModel: {
        type: String,
        required: true  
    },

    phoneStorage: {
        type: String,
        required: true 
    },

    phoneColor: {
        type: String,
        required: true 
    },

    imei: {
        type: String,
        unique: true,
        required: true  
    },

    rate: {
        type: String,
        required: true 
    },

    priceUsd: {
        type: String,
        required: true 
    },

    priceTzs: {
        type: String,
        required: true 
    },

    cost: {
        type: String,
        required: true 
    },

    description: {
        type: String,
        required: true 
    },

    barCode: {
        type: String,
        required: true
    }
});


const Item = mongoose.model('Item', ItemSchema); 

module.exports = Item;