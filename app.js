const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const moment = require('moment')
const users = require('./routes/user')
const db = require('./config/db')

const passport = require('passport')
require('./config/auth')(passport)

require('./models/Post')
const Post = mongoose.model('posts')

require('./models/Tag')
const Tag = mongoose.model('tags')




app.use(session({
    secret: 'secretexemple',
    resave: true,
    saveUninitialized: true
}))


app.use(passport.initialize())
app.use(passport.session())


app.use(flash())


app.use((req, res, next) => {
    console.log('MiddleWare Called')
    

    res.locals.success_msg =  req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null

    next()
})


app.use(express.urlencoded({extended: true}))
app.use(express.json())


app.engine('handlebars', handlebars.engine({defaultLayout: 'main', helpers: {
    formatDate: (date) => {
         return moment(date).format('DD/MM/YYYY')
     }
}}))
app.set('view engine', 'handlebars')


mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI).then(()=> {
    console.log('Conectado Ao Mongo')
}).catch((err) => {
    console.log('Erro ao conectar: ' + err)
})


app.use(express.static(path.join(__dirname, 'public')))


app.get('/', (req, res) => {
    Post.find().lean().populate('tag').sort({data: 'desc'}).then((posts) => {
        res.render('index', {posts: posts})
    }).catch((err) => {
        console.log('Erro ao listar: ' + err)
        req.flash('error_msg', 'Erro ao listar posts')
        res.redirect('/404')
    })
})

app.get('/post/:slug', (req, res) => {
    Post.findOne({slug: req.params.slug}).lean().then((post) => {
        if(post){
            res.render('post/index', {post: post})
        }else{
            req.flash('error_msg', 'Post Doesnt Exist')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Internal Error')
        res.redirect('/')
    })
})

app.get('/404', (req, res) => {
    res.send('Erro 404 X~X')
})

app.get('/tags', (req, res) => {
    Tag.find().lean().then((tags) => {
        res.render('tag/index', {tags: tags})
    }).catch((err) => {
        console.log('Erro ao listar: ' + err)
        req.flash('error_msg', 'Erro ao listar tags')
        res.redirect('/404')
    })
})

app.get('/tags/:slug', (req, res) => {
    Tag.findOne({slug: req.params.slug}).lean().then((tag) => {
        if(tag) {   
            Post.find({tag: tag._id}).lean().then((posts) => {
                res.render('tag/post', {posts: posts, tag: tag})
            }).catch((err) => {
                console.log(err)
                req.flash('error_msg', 'Internal Error')
                res.redirect('/')
            })
        }else {
            req.flash('error_msg', 'Tag Doesnt Exist')
            res.redirect('/')
        }
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', 'Internal Error')
        res.redirect('/')
    })
})




//app.get('/posts', (req, res) => {
//    res.send('Pagina Posts')
//})

app.use('/admin', admin)
app.use('/users', users)

const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log('Servidor Rodando!')
})