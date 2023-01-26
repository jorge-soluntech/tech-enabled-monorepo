const { connect } = require('http2')
const mongoose = require('mongoose')

module.exports.init = (dbConnectionString) => {

    try {
        if (!dbConnectionString) {
            throw new Error("Formato incorrecto")
        }

        mongoose.connection.on('error', (error)=> {
            const response = 'Error conenctando la base de datos. Error: ' + error
            return response
        })
        mongoose.connection.once('open', ()=> {
            return "Connection to MongoDB stablish"
        })
        mongoose.connection.on('disconected', ()=> {
            console.log("Connection to mongoDB disconnected")
        })

        return {
            getConnection() {
                return mongoose.connection
            },

            connect() {
                return mongoose.connect(dbConnectionString)
            },
            close() {
                return mongoose.connection.close()
            }
        }

    } catch (error) {
        console.error("Error conectando la base de datos: ", error.message)
    }

}