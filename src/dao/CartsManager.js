const cartsModelo = require("../dao/models/CartModel.js");

class CartsManager {

    async getCarritos(limit){
        try {
            return await cartsModelo.find().limit(limit).lean();
        }
        catch(error){
            console.log(error,"Error desde getCarritos");
        }
    }

    async crearCarrito(NuevoCarrito){
        try {
            return await cartsModelo.create(NuevoCarrito);
        }
        catch(error){
            console.log(error,"Error desde crearCarrito");
        }
    }

    async getCarritotById(cid){
        try {
            return await cartsModelo.findById(cid); //{_id:cid}
        } 
        catch(error){console.log(error, "Error en el getCarritoById")}
    }

    async updateCart(cid, update){
        try {
            return await cartsModelo.findByIdAndUpdate(cid, update,{runValidators:true, returnDocument:"after"});
        }
        catch(error){
            console.log(error, "Error desde updateCart");
        }
    }

    async updateProduct(cid, update){

        const carrito = cartsModelo.findById({_id:cid});
        if(carrito){
                let producto = carrito.products.find((prod) => prod.productId == pid);
                if(producto){
                    producto.quantity += 1;
                } else {
                    carrito.products.push({productId:pid, quantity:1 });
                }
            try {
                await guardarArchivo(); 
                return true ; // `Archivo Actualizado`
            }
            catch(error){
                console.log(error.message);
            }
            
        } else {
            return false; // `El carrito con el id: ${cid} no existe`
        }
    }

    async deleteCarrito(pid){
        try{
            return await cartsModelo.deleteOne(pid);
        }
        catch(error){
            console.log(error,"Error desde deleteProduct")
        }
    }

}
module.exports = CartsManager;