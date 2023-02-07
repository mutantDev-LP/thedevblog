const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const passport = require('passport')

require('../models/User')
const User = mongoose.model('users')


router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', (req, res) => {
    var errors=[]

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: 'Nome Inválido'})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        errors.push({text: 'Email Inválido'})
    }

    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        errors.push({text: 'Senha Inválido'})
    }

    if(req.body.password.length < 4){
        errors.push({text: 'Senha Muito Curta!'})
    }

    if(req.body.password != req.body.password2){
        errors.push({text: 'As Senhas São Diferentes!'})
    }

    if(errors.length > 0) {
        res.render('users/register', {errors: errors})
    }else {
        User.findOne({email: req.body.email}).lean().then((user) => {
            if (user) {
                req.flash('error_msg', 'Email Sendo Utilizado!')
                res.redirect('/users/register')
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if (error){
                            req.flash('error_msg', "Can't Save User (Internal Error)")
                            res.redirect('/')
                        }

                        newUser.password = hash

                        newUser.save().then(() => {
                            req.flash('success_msg', "User Registered")
                            res.redirect('/')
                        }).catch((err) => {
                            console.log(err)
                            req.flash('error_msg', "Can't Register User (Internal Error)")
                            res.redirect('/')
                        })
                    })
                })
            }
        }).catch((err) => {
            console.log('Erro: '+err)
            req.flash('error_msg', "Can't Register User!")
            res.redirect('users/register')
        })
    }
})

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'Success LogOut')
    res.redirect('/')
})


module.exports = router