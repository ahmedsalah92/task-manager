const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const router = new express.Router()
const sharp = require('sharp')
const { sendWelcomeEmail } = require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.send({ user: user.hideSensiveData(), token })

    } catch (e) {
        res.status(400).send()
        console.log(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        console.log(req.user)
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        console.log(req.user)
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send()
    }
})


const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return callback(new Error('please upload image'))

        return callback(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {


    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
})
router.get('/users/:id/avatar', async (req, res) => {
    user = await User.findById(req.params.id)

    res.set('content-type', 'image/png')
    res.send(user.avatar)
})


router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.user)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {

        updates.forEach((update) => req.user[update] = req.user[update])
        await user.save()

        if (!req.user) {
            return res.status(404).send()
        }

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router