const express = require('express')
const routerUser = require('./routes/routes')

class Server {
    constructor() {
        this.app = express()
        this.middlewares()
    }

    middlewares() {
        this.app.use( express.json() )
    }

    routes(userRepository){
        this.app.use('/user',  routerUser.init(userRepository))
    }

    listen(port) {
        this.app.listen(port, ()=> {
            console.log("El servidor esta escuchando en el siguiente puerto: ", port)
        })
    }
}

module.exports = Server;