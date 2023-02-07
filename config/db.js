if (process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: "mongodb+srv://admin:<Plsm2021Plsm>@thedevdb.eqfwdez.mongodb.net/?retryWrites=true&w=majority"
    }
} else {
    module.exports = {
        mongoURI: 'mongodb://127.0.0.1/mdev'
    }
}