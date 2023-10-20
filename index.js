const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yzxiuvw.mongodb.net/?retryWrites=true&w=majority`;

// console.log(uri)

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
    const productCollection = client.db('productDB').collection('product');
    const AddToProduct = client.db('productDB').collection('addProduct')

    app.post('/product', async(req, res) =>{
        const newProduct = req.body;
        const result = await productCollection.insertOne(newProduct);
        res.send(result);
      })
      app.get('/product', async (req, res) =>{
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })

      app.get('/addToCart', async(req, res) =>{
        const cursor = AddToProduct.find();
        const products = await cursor.toArray();
        res.send(products)
      })

      // Add to Cart data add Server
      app.post('/addToCart', async(req, res) =>{
        const productAdd = req.body;
        const result = await AddToProduct.insertOne(productAdd)
        res.send(result);
      })
      app.get('/addToCart/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await AddToProduct.findOne(query);
        res.send(result);
      })

      app.delete('/addToCart/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await AddToProduct.deleteOne(query);
        res.send(result);
      })

      app.get('/product/:id', async(req, res) =>{
           const id = req.params.id;
          const query = {_id: new ObjectId(id)}
          const result = await productCollection.findOne(query);
          res.send(result);
      })

      app.put('/product/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const updateProduct = req.body;
        const product = {
          $set: {
            name: updateProduct.name,
            brand: updateProduct.brand,
            price: updateProduct.price,
            available: updateProduct.available,
            category: updateProduct.category,
            rating: updateProduct.rating,
            discriptions: updateProduct.discriptions, 
            photoURL: updateProduct.photoURL
          }
        }
        const result = await productCollection.updateOne(filter, product,options);
        res.send(result)
      })

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Electronics server is runing')
})

app.listen(port, () => {
    console.log(`Electronics server is al OKEY: ${port}`)
})