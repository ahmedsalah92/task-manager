const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, { useNewUrlParser: true,useUnifiedTopology: true  }, (error, client) => {
    if (error)
        return console.log('Unable to connect')

    const db = client.db(databaseName)

    // db.collection('users').insertOne(
    //     {
    //         name:'Aml',
    //         age:'40'
    //     })

})