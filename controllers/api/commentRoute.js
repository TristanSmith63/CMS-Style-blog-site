const express = require('express')
const router = express.Router()
const Comment = require('../../models/Comment')
const Blog = require('../../models/Blog')
const sequelize = require('sequelize')



// all comments
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.findAll()

        if(!comments || comments.length === 0){
            res.status(404).json({message: 'No comments found'})
        }

        commentsPlain = comments.map(comment => comment.get({ plain: true }))

            res.status(200).json(commentsPlain)
                
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error', error })
    }
})

// comment
router.put('/:id', async (req, res) => {
    try {
        const comment = await Blog.findByPk(req.params.id)
        res.status(200).json(comment)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error', error })
    }
})

// delete comment
router.delete('/delete/:id', async (req, res) => {
    const commentId = req.params.id

    await Comment.destroy({
        where:{
            comment_id : commentId
        }
    })

    res.status(200).json({message: 'Deleted Comment Succesfully'})

    
})

module.exports = router