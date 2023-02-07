const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Tag')
const Tag = mongoose.model('tags')
require('../models/Post')
const Post = mongoose.model('posts')
const {isAdmin} = require('../helpers/isAdmin')

router.get('/', isAdmin, (req, res) => {
    res.render('/index')
})


router.get('/tags', isAdmin, (req, res) => {
    Tag.find().lean().sort({date: 'desc'}).then((tags) => {
        res.render('admin/tags', {tags: tags})
    }).catch((err) => {
        console.log('Erro: '+err)
        req.flash('error_msg', "Can't load tags!")
        res.redirect('/admin')
    })
    
})

router.get('/tags/add', isAdmin, (req, res) => {
    res.render('admin/addTag')
})

router.post('/tags/new', isAdmin, (req, res) => {
    
    var errors = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: 'Invalid Name'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({text: 'Invalid Slug'})
    }

    if(errors.length > 0){
        res.render('admin/addTag', {errors: errors})
    }else {
        const newTag = {
            name: req.body.name,
            slug: req.body.slug
        }
    
        new Tag(newTag).save().then(()=> {
            req.flash('success_msg', 'Tag Created!')
            console.log('Created New Tag')
            res.redirect('/admin/tags')
        }).catch((err) => {
            req.flash('error_msg', 'Tag Not Created!')
            console.log('Error :' + err)
            res.redirect('/admin')
        })
    }

})

router.get('/tags/edit/:id', isAdmin, (req, res) => {
    Tag.findOne({_id:req.params.id}).lean().then((tag) => {
        res.render('admin/editTags', {tag: tag})
    }).catch((err) => {
        req.flash('error_msg', "Tag Doesn't Exist")
        res.redirect('admin/tags')
    })
})

router.post('/tags/edit', isAdmin, (req, res) => {
    Tag.where({_id: req.body.id}).update({nome:req.body.name, slug:req.body.slug}).then((tag) => {
        req.flash("success_msg", "Tag Edited")
        res.redirect('/admin/tags')
    }).catch((err) => {
        req.flash('error_msg', "Can't Edit Tag")
        res.redirect('/admin/tags')
    })
})

router.post('/tags/del', isAdmin, (req, res) => {
    Tag.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', "Tag Deleted")
        res.redirect('/admin/tags')
    }).catch((err) => {
        req.flash('error_msg', "Can't Delete Tag (Internal Error)")
        res.redirect('/admin/tags')
    })
})

router.get('/posts', isAdmin, (req, res) => {
    Post.find().lean().populate('tag').sort({data: 'desc'}).then((posts) => {
        res.render('admin/posts', {posts: posts})
    }).catch((err) => {
        req.flash('error_msg', "Can't List Posts")
        res.redirect('/admin')
    })
})

router.get('/posts/add', isAdmin, (req, res) => {
    Tag.find().lean().then((tags) => {
        res.render('admin/addPost', {tags: tags})
    }).catch((err) => {
        req.flash('error_msg', "Can't Create Post (Interna Error)")
    })
})
 
router.post('/posts/new', isAdmin, (req, res) => {
    var errors=[]

    if(req.body.tag == "0") {
        errors.push({text: "Invalid Tag"})
    }

    if(errors.length > 0) {
        res.render('admin/addPost', {errors: errors})
    } else {
        const newPost = {
            title: req.body.title,
            desc: req.body.desc,
            content: req.body.content,
            tag: req.body.tag,
            slug: req.body.slug
        }

        new Post(newPost).save().then(() => {
            req.flash('success_msg', 'New Post Created')
            console.log('Post Criado')
            res.redirect('/admin/posts')
        }).catch((err) => {
            req.flash('error_msg', "Can't Create Post (Internal Error)")
            res.redirect('/admin/posts')
        })
    }
})

router.get('/posts/edit/:id', isAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).lean().then((post) => {
        Tag.find().lean().then((tags) => {
            res.render('admin/editPost', {tags: tags, post: post})
        }).catch((err) => {
            req.flash('error_msg', "Can't List Tags (Internal Error)")
        res.redirect('/admin/posts')
        })
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', "Can't Edit Post (Internal Error)")
        res.redirect('/admin/posts')
    })
})

router.post('/post/edit', isAdmin, (req, res) => {
    Post.findByIdAndUpdate({_id:req.body.id}).sort({data: 'desc'}).then((post) => {

        post.title = req.body.title
        post.slug = req.body.slug
        post.desc = req.body.desc
        post.content = req.body.content
        post.tag = req.body.tagia


        post.save().then(() => {
            req.flash('success_msg', 'Post Edited')
            res.redirect('/admin/posts')
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', "Internal Error")
            res.redirect('/admin/posts')
        })
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', "Can't Save Post (Internal Error)")
        res.redirect('/admin/posts')
    })
})

router.get('/posts/del/:id', isAdmin, (req, res) => {
    Post.deleteOne({_id: req.params.id}).lean().then(()=> {
        req.flash('success_msg', 'Post Deleted')
        res.redirect('/admin/posts')
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', "Can't Delete Post (Internal Error)")
        res.redirect('/admin/posts')
    })
})

module.exports = router