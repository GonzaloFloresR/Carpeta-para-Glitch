const Router = require("express");
const router = Router();
const path = require("path");
const CartsManager = require("../dao/CartsManager.js");
const ProductManager = require("../dao/ProductManagerMONGO.js");
const {isValidObjectId} = require("mongoose");


const entorno = async() => { 
    const cartManager = new CartsManager();
    const productManager = new ProductManager();

    router.get("/", async (request, response) => {
        try {
            let carrito = await cartManager.getCarritos();
            if(carrito){
                response.setHeader('Content-Type','application/json');
                return response.status(200).json(carrito);
            } else {
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:`No hay carritos activos ❌`});
            }
        }
        catch(error){
            console.log(error);
            response.setHeader('Content-Type','application/json');
            return response.status(500).json({
                error:"Error inesperado en el servidor - intente más tarde",
                detalle:`${error.message}`});
            
        } 
    });

    router.get("/:cid", async(request, response) => {
        let {cid} = request.params;
        
        if(!isValidObjectId(cid)){
            response.setHeader('Content-Type','application/json');
            return response.json({error:"Ingrese un ID Valido de Mongo"});
        } else {
            try {
                let carrito = await cartManager.getCarritotById({_id:cid});
                if(carrito){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json(carrito.products);
                } else {
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({error:`No existe carrito con el ID ${cid}`});
                }
            }
            catch(error){
                console.log(error);
                response.setHeader('Content-Type','application/json');
                return response.status(500).json({
                    error:"Error inesperado en el servidor - intente más tarde",
                    detalle:`${error.message}`});
            } 
        }
    });

    router.post("/", async(request, response) => {
        let {products} = request.body; 
        
        if(!products){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({status:"error", error:"Debe Agregar productos al carrito"});
        } else {
                products.forEach(element => {
                    isValidObjectId()
                });



            try {
                let agregado = await cartManager.crearCarrito({products});
                if(agregado){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json({status:"succes", message:"Producto Agregado correctamente ✅"});
                } else {
                    response.setHeader('Content-Type','application/json');
                    response.status(400).json({status:"error", message:"El producto no se pudo agregar"})
                }
            } 
            catch(error){
                console.log(error);
                response.setHeader('Content-Type','application/json');
                return response.status(500).json({
                    error:"Error inesperado en el servidor - intente más tarde",
                    detalle:`${error.message}`});
            }
        }
    });

    router.post("/:cid/product/:pid", async(request, response) => {
        let cid = request.params.cid;
        let pid = request.params.pid;
        let carritos = carrito.getCarritos();
        cid = Number(cid);
        pid = Number(pid);
        if(isNaN(cid) || isNaN(pid) ){
            response.setHeader('Content-Type','application/json');
            response.status(400).json({error:"Ingrese un cid y pid numéricos"});
        } else {
            let hecho = await cartManager.updateProduct(cid,pid);
            if(hecho){
                response.setHeader('Content-Type','application/json');
                response.status(200).json({status:"succes", message:"Producto Agregado Satisfactoriamente"});
            } else {
                response.setHeader('Content-Type','application/json');
                response.status(400).json({status:"error", message:"No se pudo agregar el producto"});
            } 
            
        }
    });

} //cerrando entorno async

entorno();

module.exports = router;