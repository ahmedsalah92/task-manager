const Task = require('../models/task')
const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router

router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        ownerId: req.user.id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//get task by completed filter 
router.get('/tasks', auth, async (req, res) => {
    try {

        const match = {}
        if (req.query.completed)
            match.completed = req.query.completed === 'true'

        else if (req.query.completed === 'false')
            match.completed = req.query.completed === 'false'

        const sort = {}
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }


        user = await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }

        }).execPopulate()
        console.log(user.tasks)
        res.send(user.tasks)
    }
    catch (e) {
        res.send('error')
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    console.log(req.user.id)
    console.log(req.params.id)

    try {
        const task = await Task.findOne({ _id, 'ownerId': req.user.id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        const task = await Task.findById(req.params.id)
        //console.log(task)
        updates.forEach((update) => task[update] = req.body[update])
        console.log(task)

        await task.save()

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router