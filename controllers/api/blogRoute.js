const router = require('express').Router()
const {Blog, Comment, User} = require('../../models')
const { Sequelize, json } = require('sequelize')
const isAuthenticated = require('../../utils/authorize')
const color = require('colors')

// Delete a blog
router.delete('/:id/delete', isAuthenticated, async (req, res) => {
	
	console.log(`%cBlog delete triggered blogroutes ln 44`, `color: green`)
	try {
		const id = req.params.id;
		const blog = await Blog.destroy({where: { blog_id: id }})
		if(!blog) {
			return res.status(404).json({ message: 'No blogs found' })
		}
		res.json({ message: 'Blog deleted' })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Server Error' })
	}
})

// edit blog form
router.get('/:id/editBlog', isAuthenticated, async (req, res) =>{
	try{
		const id = req.params.id
		const blogData = await Blog.findOne({
			where: {blog_id: id}
		})
		if(!blogData){
			res.status(404).json({message: `no blog found`})
		}
		
		const blog = await blogData.get({plain: true})
		console.log(`got blog data ln 72:${Object.keys(blog)}`.green)
		
		res.json(blog)
		
	}
	catch(error){
		console.log(error.red)
	}
})
	
// get blog by id
router.get('/:id', async (req, res) => {
	try {
		const id = req.params.id
		const blogData = await Blog.findOne({
			where: { blog_id: id },
			include: [
				{
					model: User,
					attributes: ['username']
				},
				{
				model: Comment,
				attributes: ['comment', 'user_id', 'createdAt'],
				include:[{
					model: User,
					attributes: ['username']
					}]
				}
			]})
		if(!blogData) {
			return res.status(404).json({ message: 'No blogs found' })
		}
		const blog = blogData.get({plain: true})

		
		res.render('blog', {
			blog,
			logged_in: req.session.logged_in
		})
	} catch (error) {
		res.status(500).json({ message: 'Server Error', error })
	}
})

// post a blog
router.post('/newBlog', isAuthenticated, async (req, res) => {
	
	try {
		let { title, text} = req.body

		if(!title || !text) {
			console.log(`Missing required fields`)
			return res.status(400).json({ message: 'Missing required fields' })
		}
		const newBlog = await Blog.create({
			title,
			text,
			user_id: req.session.user_id
		})
		
		
		res.redirect('/dashboard')

	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Server Error', error })
		}
})

// update a blog
router.put('/:id', isAuthenticated, async (req, res) => {
	try {
		const { title, text } = req.body
		if(!title || !text){
			console.log(`*error no content to update*`)
			return
		}

		const id = req.params.id
		const blog = await Blog.findByPk(id)

		if(!blog) {
			return res.status(404).json({ message: 'No blogs found' })
		}
		const newBlog = await blog.update({ title, text })
		res.status(202).json(newBlog)

	} catch (error) {
		res.status(500).json({ message: 'Server Error updating post', error })
	}
})

// add comment
router.post('/:id/comment', isAuthenticated, async (req, res) => {

	try {
		const id = req.params.id
		const blog = await Blog.findOne({
			where: { 
				blog_id: id 
			}
		})
		if(!blog) {
			return res.status(404).json({ message: 'No blogs found' })
		}

		if(!req.body.comment) {
			return res.status(400).json({ message: 'Missing required fields' })
		}

		const comment = await Comment.create({
			comment: req.body.comment,
			user_id: req.session.user_id,
			blog_id: parseInt(id)
		})

		const fullPost = await blog.addComment(comment)

		res.redirect(`/api/blogs/${id}`)
		
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Server Error updating post', error })
	}
})

module.exports = router