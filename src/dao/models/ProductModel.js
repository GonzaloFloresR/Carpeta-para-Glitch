let mongoose = require("mongoose");

const productCollection = "products";
const productosEsquema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    thumbnail: String,
    code: {type: String, unique: true, required:true},
    stock: Number
},{
    timestamps:true
});

const productoModelo = mongoose.model(
    productCollection,
    productosEsquema
);


module.exports = productoModelo;