const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/User')
const User = mongoose.model('users')

module.exports = function(passport) {
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        
        User.findOne({email: email}).lean().then((user) => {
            if(!user) {
                return done(null, false, {message: "User Doesn't Exist!"})
            }

            bcrypt.compare(password, user.password, (error, check) => {
                if(check) {
                    return done(null, user)
                } else {
                    return done(null, false, {message: "Wrong Password!"})
                }
            })
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}

