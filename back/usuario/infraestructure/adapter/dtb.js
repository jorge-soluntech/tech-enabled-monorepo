

function init(dtbSchema) {    

    async function ValidateUser(email=String) {
        console.log("Entramos al adaptador de DTB INFRA: ", dtbSchema)
        if (!email) {
            return false
        }
        return true
    }

    return {
        ValidateUser
    }
}

module.exports.init = init