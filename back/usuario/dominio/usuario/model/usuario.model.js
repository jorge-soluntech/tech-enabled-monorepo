class Usuario { 

    constructor({_id, name, username, email, created}={}) {
        this._id = _id;
        this.name = name;
        this.email = email;
        this.fullname = name + ' ' + username;
    }
}

module.exports = Usuario;