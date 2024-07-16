const router = require('express').Router()
const {User} = require('../../models')



// signup
router.post('/signup', async (req, res) => {
	await signup(req, res)
})

async function signup(req, res){
	try {
		let {username, password1, password2} = req.body
		
		if(!username || !password1 ||!password2){
			return res.status(400).json({message: 'Please enter a username and password'})
		}
		if(password1 !== password2){
			return res.status(400).json({message: 'Passwords do not match'})
		}
		
		const password = password1
		username = username.toLowerCase()
		const user = {
			username,
			password
		}
		const userData = await User.create(user)
		await loginSess(req, res, userData)
		
	} catch (error) {
		res.status(500).json({message: 'Server Trouble signing up', error})	
	}
}

// login
router.post('/login', async (req, res) => {
	await login(req, res)
})

async function login(req, res) {
	try {
		let {username, password} = req.body
		if(!username || !password){
			return res.status(400).json({message: 'Please enter a username and password'})
		}

		username = username.toLowerCase()
		const userData= await User.findOne({where: {
			username: username
		}})
		
		if(!userData){
			return res.status(400).json({message: 'Username or password incorrect'})
		}
		const validPassword = userData.checkPassword(password)
		if(!validPassword){
			return res.status(400).json({message: 'Username or password incorrect'})
		}

		await loginSess(req, res, userData)
	} catch (error) {
		console.log(error.red)
		res.status(500).json({message: 'Trouble logging in', error})	
	}
}
// login session
async function loginSess(req, res, userData) {
	try {
		req.session.save(() => {
			req.session.user_id = userData.user_id
			req.session.username = userData.username
			req.session.logged_in = true
			res.redirect('/')
			
		})
	} catch (error) {
		res.status(400).json({ message: 'Trouble logging in', error })
	}
}

// logout
router.post('/logout', async (req, res) => {
	await logout(req, res)
})
	
async function logout(req, res) {
	try {
		const logged_in = await req.session.logged_in
		if(logged_in){
			await req.session.destroy(() => {
				console.log(`logout route ln104: ${logged_in}`)
				res.status(204).json({message:`logged out`}).end()
			})
	
		}else{
			res.status(404).end()
		}
	
	} catch (error) {
		console.log(error.red)
		res.status(500).json({message: `error logging out`, error})
	}
}

module.exports = router