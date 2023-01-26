const config = require('./infraestructure/config/config')

// DOMINIO
const userDominio = require('./dominio/usuario/ports/services')

// USECASE 
const userUseCase = require('./usecase/usuario/usuario.usecase')

// INFRAESTRUCTURE
const Server = require('./infraestructure/http/app')
const dtbAdapter = require('./infraestructure/adapter/dtb')
const userSchemaDtb = require('./infraestructure/dtb/usuario/model')

const dtbInfraAdapterUser = dtbAdapter.init(userSchemaDtb())

const userRepository = userUseCase.init(dtbInfraAdapterUser)
const userPorts = userDominio.init(userRepository) //<- recive nuestros casos de uso

exports.handler = async function(event) {

    const appServer = new Server()
    appServer.routes(userPorts)
    appServer.listen(config.port)
    
}