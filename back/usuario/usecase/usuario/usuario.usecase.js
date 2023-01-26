const userModel = require('../../dominio/usuario/model/usuario.model')

var userModels = new userModel()

const Usuario = {
    async Registrar(user=userModels){
        console.log("2. Entramos a los casos de uso")
        const [infra] = await Promise.all([
            this.infraAdapter()
        ])
        const validarUsuario =  infra.ValidateUser(user.email)
        return validarUsuario
    }
}

module.exports.init = (infraDTB) => {
    return Object.assign(Object.create(Usuario), {
        infraAdapter() {
            return infraDTB
        }
    })
}