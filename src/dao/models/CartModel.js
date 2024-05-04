const { ObjectId } = require("mongodb");
let mongoose = require("mongoose");

const cartsCollection = "carts";
const cartsEsquema = new mongoose.Schema(
    {
        products: { type:   [
                                {
                                    productId: {
                                        type: mongoose.Types.ObjectId,
                                        ref: "products"
                                    },
                                    quantity: Number
                                }
                            ]
        }
    },
    {
        timestamps:true,
        strict:true
    }
    
);

const cartsModelo = mongoose.model(
    cartsCollection,
    cartsEsquema
);

module.exports = cartsModelo;
