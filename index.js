const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000
const ObjectId = require('mongodb').ObjectId
//middle are
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u5ucb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("connected database")
        const database = client.db("Dream_car");
        const productCollection = database.collection("products")
        const bookedorder = database.collection("bookedorders")
        const customerreview = database.collection("productreview")
        const useriformation = database.collection("users")

        //Get api for products show in display
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({})
            const service = await cursor.toArray()
            res.send(service)
        })
        //post api for add product in database
        app.post('/products', async (req, res) => {
            const product = req.body
            const result = await productCollection.insertOne(product)
            res.send(result)
        })
        //delete api for product delete 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            console.log('delete product', id)
            res.json(result)
        })

        //post api for booked orders and save in database
        app.post('/bookedorders', async (req, res) => {
            const orders = req.body
            console.log('hitted api for order', orders)
            const result = await bookedorder.insertOne(orders)
            console.log(result)
            res.send(result)
        })

        //get api for get booked orders from database
        app.get('/bookedorders', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = bookedorder.find(query)
            const order = await cursor.toArray()
            res.json(order)
        })

        //post api for review entry in database
        app.post('/productreview', async (req, res) => {
            const review = req.body
            const result = await customerreview.insertOne(review)
            res.send(result)
        })

        //get api for review show in display
        app.get('/productreview', async (req, res) => {

            const reviewrequest = customerreview.find({})
            const result = await reviewrequest.toArray()
            res.send(result)
        })

        //post api for save user data in database
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await useriformation.insertOne(user)
            console.log(result)
            res.json(result)
        })
        //upsert google sign in
        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true }
            const updatedoc = { $set: user }
            const result = await useriformation.updateOne(filter, updatedoc, options)
            res.json(result)
        })
        //make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await useriformation.updateOne(filter, updateDoc)
            res.json(result)
        })
        //admin check 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await useriformation.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true

            }
            res.json({ admin: isAdmin })
        })

    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`Example app listening at ${port}`)
})