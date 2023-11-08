const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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

const logger = (req, res, next) =>{
  console.log(req.method, req.url)
  next();
}

const verifyToken = (req, res, next) =>{
  const token = req?.cookies?.token;
  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
}
jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) =>{
    if(err){
        return res.status(401).send({message: 'unauthorized access'})
    }
    req.user = decoded;
    next();
})
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const bookCollection = client.db('bookDB').collection('book');
    const borrowCollection = client.db('bookDB').collection('borrowBook');

    // JWT related api 

    app.post('/jwt',logger, async(req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {expiresIn: '1h'});
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success: true});
    })

    app.post('/logout', async(req, res) =>{
      const user = req.body;
      console.log('loguot',user)
      res.clearCookie('token', {maxAge: 0}).send({success: true})
    })

    // book service reltate api 

    app.get('/book', async (req, res) => {
      const cursor = bookCollection.find();
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookCollection.findOne(query);
      res.send(result);
    })
    app.post('/book', async (req, res) => {
      const newBook = req.body;
      const result = await bookCollection.insertOne(newBook);
      res.send(result);
    })

    // update book 
    app.put('/book/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateBook = req.body;
      const book = {
        $set: {
          name: updateBook.name,
          Author: updateBook.Author,
          Quantity: updateBook.Quantity,
          Date: updateBook.Date,
          Category: updateBook.Category,
          rating: updateBook.rating,
          discriptions: updateBook.discriptions,
          photoURL: updateBook.photoURL
        }
      }
      const result = await bookCollection.updateOne(filter, book, options);
      res.send(result);
    })
  
    // borrow collection 

    app.get('/borrowings',logger, verifyToken, async(req, res) => {
      console.log("coooooool", req.user)
      if(req.user.email !== req.query.email){
        return res.status(403).send({message: 'forbidden access'})
    }
      let query = {};
      if(req.query?.email){
        query = { email: req.query.email } 
      }
      const result = await borrowCollection.find(query).toArray();
      res.send(result);

    })
    app.post('/borrowings', async(req, res) => {
      const borrowing = req.body;
      const result = await borrowCollection.insertOne(borrowing);
      res.send(result);
    })

    // Delete section 

    app.delete('/borrowings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await borrowCollection.deleteOne(query);
      res.send(result)
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

app.get('/', (req, res) => {
  res.send('Books Library Server is Running')
})

app.listen(port, () => {
  console.log(`Server Run: ${port}`)
})