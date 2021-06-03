const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {

    try{
        const token = req.header('Authorization').replace('Bearer ', "")
        const payload = jwt.verify(token, 'thisIsMySecret')
        const user = await User.findOne({ _id: payload._id, 'tokens.token':token})
        //console.log(user)

        if(!user){
            throw new Error
        }
        req.token = token
        req.user = user
        //console.log({user,token})
        next()
    }
    catch(e){
        res.status(401).send('unable to autheticate')
        console.log(e)
    }
}

module.exports = auth