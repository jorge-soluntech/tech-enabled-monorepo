const {express, Router, request, response} = require('express')
const userModel = require('../../../dominio/usuario/model/usuario.model')

const router = Router()

function init(userRepository) {

    router.post('/registrar', async(req=request, res=response) => {
        console.log("1. Entramos a las rutas: INFRA")
        const user = new userModel()
        user.name = req.body.name;
        user.email = req.body.email;
        const result = await userRepository.Registrar(user)
        res.status(200).json({
            "message": result
        })
    })

    return router;
    
}

module.exports.init = init;