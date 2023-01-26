const userModel = require('../model/usuario.model')
var user = new userModel()

function init(usuarioRepository){

    async function Registrar(model=user){
        console.log("Entramos al dominio ", model)
        const result = usuarioRepository.Registrar(model);
        return result
    }

    return {
        Registrar
    }

}

module.exports.init = init