const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// bookLibrary
// GYX9cLp0deY6EgY1


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i8vh9qz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const bookCollection = client.db('bookDB').collection('book');

    app.get('/book', async(req, res) =>{
        const cursor = bookCollection.find();
        const result = await cursor.toArray()
        res.send(result)
    })

    app.post('/book', async(req, res) =>{
        const newBook = req.body;
        console.log(newBook);
        const result = await bookCollection.insertOne(newBook);
        res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected with MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('Books Library Server is Running')
})

app.listen(port, () =>{
    console.log(`Server Run: ${port}`)
})