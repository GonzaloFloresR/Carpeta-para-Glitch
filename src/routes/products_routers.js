const Router = require("express").Router;
const router = Router();
const ProductManager = require("../dao/ProductManagerMONGO.js");
const uploader = require("../utils.js");
const {isValidObjectId} = require("mongoose");

const entorno = async () => {
    const productManager = new ProductManager();
    
    router.get("/", async(request, response) => {
        let productos;
        let {limit} = request.query;
        if(limit){
            limit = Number(limit);
            if(!isNaN(limit)){
                if(limit > 0){
                    try {
                        productos = await productManager.getProducts(limit);
                        response.setHeader('Content-Type','application/json');
                        response.status(200).json(productos);
                    } catch(error) {
                        console.log(error);
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json({
                                error:"Error inesperado en el servidor - intente más tarde",
                                detalle:`${error.message}`
                            });
                    }
                } //Cerrando if limit > 0
            } else {
                response.setHeader('Content-Type','application/json');
                response.status(400).json({error:"Los limites deben ser datos numericos"});
            }
        } else { // Si no existe limit
            try { 
                productos = await productManager.getProducts();
                response.setHeader('Content-Type','application/json');
                response.status(200).json(productos);
            } catch(error){ 
                console.log(error);
                response.setHeader('Content-Type','application/json');
                response.status(500).json({
                    error:"Error inesperado en el servidor - intente más tarde",
                    detalle:`${error.message}`});
                return;
            }
        }
    });

    router.get("/:pid", async(request, response) => {
        let producto;
        let {pid} = request.params;
        if(pid){
            if(!isValidObjectId(pid)){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({erro:'Ingrese un ID valido de MongoDB'})
            } else {
                try {
                    producto = await productManager.getProductBy({_id:pid});
                }
                catch(error){
                    console.log(error);
                    response.setHeader('Content-Type','application/json');
                    return response.status(500).json(
                        {
                            error:`Error inesperado en el servidor`,
                            detalle:`${error.message}`
                        }
                    );
                }
                if(producto){
                    response.setHeader('Content-Type','application/json');
                    return response.status(200).json(producto);
                } else {
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({error:`No existe producto con ID ${pid}`}
                    );
                }
            }
            
        } else { //Si no existe params.pid
            try { 
                let productos = await productManager.getProducts();
                response.setHeader('Content-Type','application/json');
                return response.status(200).json(productos);
    
            } catch(error){ 
                console.log(error);
                response.setHeader('Content-Type','application/json');
                return response.status(500).json(
                    {
                        error:`Error inesperado en el servidor`,
                        detalle:`${error.message}`
                    }
                );
            }
        }
    });
    
    router.post("/", uploader.single('thumbnail'), async(request, response) => {
        //Recuperar todos los datos desde el cuerpo de la consulta
        let {title,description,price,thumbnail,code,stock} = request.body;
        //Verificar Si recibimos imagenenes
        if (request.file){
            thumbnail = request.file.path;
        }
        
        let existe;
        if(!title || !description || !price || !code || !stock){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json(
                {error:"valores requeridos title, description, price, code, stock"}
            );
        } else {
            code = code.trim();
            try { 
                existe = await productManager.getProductBy({code:code});
            }
            catch(error) {
                console.log(error);
                response.setHeader('Content-Type','application/json');
                return response.status(500).json(
                    {
                        error:`Error inesperado en el servidor`,
                        detalle:`${error.message}`
                    }
                );
            }   
            if(!existe){ 
                if (thumbnail){
                    thumbnail = thumbnail.replace("/Applications/MAMP/htdocs/ClaseBackend/Desafio5/src/public", "..");
                }  
                let nuevoProducto = {
                    title:title,
                    description:description,
                    price:price,
                    thumbnail:thumbnail || "../img/SinImagen.png",
                    code:code,
                    stock:stock
                };
                //Agregando nuevoProducto a la BD
                let agregado
                try {
                    agregado = await productManager.addProduct(nuevoProducto);
                } catch(error) {
                    console.log(error);
                    response.setHeader('Content-Type','application/json');
                    return response.status(500).json(
                        {
                            error:`Error inesperado en el servidor`,
                            detalle:`${error.message}`
                        }
                    );
                };
                
                if(agregado){
                    //recuperando el productos agregado para enviarlo al realtime front
                    let productos;
                    try {
                        productos = await productManager.getProductBy({_id:agregado._id});
                        request.io.emit("NuevoProducto", productos);
                        response.setHeader('Content-Type','application/json');
                        return response.status(201).json({payload:agregado}); 
                    } 
                    catch(error) { 
                        console.log(error);
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json(
                            {
                                error:`Error inesperado en el servidor`,
                                detalle:`${error.message}`
                            }
                        );
                    }
                } else { //Cerrando si se agrego
                    response.setHeader('Content-Type','application/json');
                    response.status(400).json({status:"error", message:"El producto no se pudo agregar"});
                }
            } else { //Si se encuentra el "code" en la Base de datos
                response.setHeader('Content-Type','application/json');
                response.status(400).json(
                    {   
                        status:"error",
                        message:`Codigo Repetido ${code}`
                    }
                );
            } //fin condición !existe
        } //cerrando "else" donde confirmamos recibir todos los datos del productos
    });

    router.put("/:pid", async(request, response) => {
        //Debería verificar que al menos modifique una propiedad.
        let {pid} = request.params;
        if(!pid){
            response.setHeader('Content-Type','application/json');
            return response.status(400).json({error:`Debe ingresar el ID del producto a modificar`});
        } else {
            let producto;
            if(!isValidObjectId(pid)){
                response.setHeader('Content-Type','application/json');
                return response.status(400).json({error:"Ingrese un ID Valido para MongoDB"});
            } else {
                //busco si existe producto con ese ID
                try {
                    producto = await productManager.getProductBy({_id:pid});
                } catch(error){
                    console.log(error);
                    response.setHeader('Content-Type','application/json');
                    return response.status(500).json(
                        {
                            error:`Error inesperado en el servidor`,
                            detalle:`${error.message}`
                        }
                    );
                }
                
                if(producto){
                    //modifico el producto
                    let modificado;
                    let modificaciones = request.body;
                    console.log(modificaciones);
                    if(modificaciones._id){
                        //Si entre las modificaciones incluye el _id,
                        // eliminio esa propiedad, dado que no se debe modificar el _id
                        delete modificaciones._id; 
                    }
                    if(modificaciones.code){
                        try {
                            existe = await productManager.getProductBy({_id:{$ne:pid},code:modificaciones.code});
                            if(existe){
                                response.setHeader('Content-Type','application/json');
                                return response.status(400).json({error:`Ya existe un producto con el code ${modificaciones.code}`});
                            }
                        }
                        catch(error){
                            console.log(error);
                            response.setHeader('Content-Type','application/json');
                            return response.status(500).json(
                                {
                                    error:`Error inesperado en el servidor`,
                                    detalle:`${error.message}`
                                }
                            );
                        }
                    }
                    try {
                        modificado = await productManager.updateProduct(pid, modificaciones);
                    } catch(error){
                        console.log(error);
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json(
                            {
                                error:`Error inesperado en el servidor`,
                                detalle:`${error.message}`
                            }
                        );
                    } if(modificado){
                        request.io.emit("ProductoActualizado", modificado);
                        response.setHeader('Content-Type','application/json');
                        return response.status(200).json({modificado});
                    } else {
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json({status:"error", message:`No se pudo modificar ID ${pid}`});
                    }
                } else {
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({error:`No existe un producto con el ID ${pid}`});
                }
            }
        }
    });

    router.delete("/:pid", async(request, response) => {
        let pid = request.params.pid;
        if(!pid){
            response.setHeader('Content-Type','application/json');
            response.status(400).json({error:`Debe ingresar el ID del producto a eliminar`});
        } else {
            if(!isValidObjectId(pid)){
                response.setHeader('Content-Type','application/json');
                response.status(400).json({error:"Ingrese un ID numérico "});
            } else {
                let producto;
                try {
                    producto = await productManager.getProductBy({_id:pid});
                } catch(error){
                    console.log(error);
                    response.setHeader('Content-Type','application/json');
                    return response.status(500).json(
                        {
                            error:`Error inesperado en el servidor`,
                            detalle:`${error.message}`
                        }
                    );
                }
                if(producto){
                    let borrado;
                    try {
                        borrado = await productManager.deleteProduct({_id:pid});
                    } catch(error){
                        console.log(error);
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json(
                            {
                                error:`Error inesperado en el servidor`,
                                detalle:`${error.message}`
                            }
                        );
                    }
                    if(borrado){
                        request.io.emit("ProductoEliminado", pid);
                        response.setHeader('Content-Type','application/json');
                        return response.status(200).json({status:"succes", message:`Producto con ID ${pid} Eliminado ✅`});
                    } else {
                        response.setHeader('Content-Type','application/json');
                        return response.status(500).json({error:`Error al intentar elimimnar el producto ${pid}`});
                    }
                } else { //Si el producto no existe
                    response.setHeader('Content-Type','application/json');
                    return response.status(400).json({error:`No existe producto con el ID ${pid}`});
                }
            }
        }
    });
}//Cerrando entorno()

entorno();

module.exports = router;