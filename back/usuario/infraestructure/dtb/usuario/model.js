const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    name:{
        type: String,
        required: false
    },
    username:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:true 
    },
    password:{
        type:String,
        required:true
    }

})

module.exports = model('usuario', userSchema)