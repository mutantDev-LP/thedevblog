const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Post = new Schema({
    title: {
        type: String
    },
    slug: {
        type: String
    },
    desc: {
        type: String
    },
    content: {
        type: String
    },
    tag: {
        type: Schema.Types.ObjectId,
        ref: "tags"
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('posts', Post)