const router = require('express').Router()
const {User, Blog, Comment} = require('../models')
const { Sequelize } = require('sequelize')
const isAuthenticated = require('../utils/authorize')
const colors = require('colors')

//  blogs homepage
router.get('/', async (req, res) => {
	try {
		const blogData = await Blog.findAll({
			include:[
				{
					model: User,
					attributes: ['username']
					
				},
				
			]
		})
		if(!blogData){
			return 'No blogs found!'
		}

		const blogs = blogData.map(blog => blog.get({plain: true}))
		res.render('homepage', {
			blogs,
			logged_in: req.session.logged_in
		})
	} catch (error) {
		res.status(500).json({msg:`Trouble getting blogs:`, error})
	}
})

// get blogs 
router.get('/dashboard', isAuthenticated,  async (req, res) => {
	
	try {
		const userData = await User.findByPk(req.session.user_id,{
			attributes: {
				exclude: [
					'password'
				]
			},
			include: [
				{
					model: Blog,
					include: [
						{
							model:User,
							attributes: ['username']
						}
					]
				}, 
				
			]
		})
		const user = userData.get({plain: true})
		res.render('dashboard', {
			...user,
			logged_in: req.session.logged_in
		})
	} catch (error) {
		res.status(500).json({msg:`Trouble loading dashboard:`, error})
	}
})



module.exports = router