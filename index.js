const express = require('express');
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
const port = process.env.PORT || 3000
require('dotenv').config();
app.use(cors())
app.use(express.json())

// index.js
const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEY, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6aaggy0.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyToken = async(req , res , next)=>{
  const authorization = req.headers.authorization
  if(!authorization){
    return res.status(401).send({message: 'unauthorized access'})
  }
  const token = authorization.split(' ')[1]
  try{
   await admin.auth().verifyIdToken(token)
   next()
  }
  catch(error){
    return res.status(401).send({message: 'unauthorized access'})
  }

}
app.get('/' , (req , res)=>{
    res.send('book haven server is running')
})

async function run() {
  try {
  // await client.connect();
const db = client.db('books_haven')
const booksCollection = db.collection('books')
const commentCollection = db.collection('comments')
app.get('/books' , async(req , res)=>{
  const cursor = booksCollection.find().sort({rating: -1})
  const result = await cursor.toArray()
  res.send(result)
})
app.get('/comments/:id' , async(req , res)=>{
  const id = req.params.id;
  const query = {book_id : id}
  const cursor = commentCollection.find(query)
  const result = await cursor.toArray()
  res.send(result)
})
app.post('/comments' , async(req , res)=>{
  const data = req.body;
  console.log(data)
  const result = await commentCollection.insertOne(data)
  res.send(result)
})
app.get('/featuredBooks' , async(req , res)=>{
  const cursor = booksCollection.find().sort({rating: -1}).limit(7)
  const result = await cursor.toArray()
  res.send(result)
})
app.get('/latest-book', async(req, res)=>{
  const cursor = booksCollection.find().sort({created_at : -1}).limit(6)
  const result = await cursor.toArray()
  res.send(result)
})
app.get('/myBooks', verifyToken , async(req , res)=>{
const email = req.query.userEmail;
const query = {}
if(email){
  query.userEmail = email
}
const result = await booksCollection.find({userEmail: email}).toArray()
res.send(result)
})
app.post('/books' , async(req , res)=>{
  const data = req.body;
  console.log(data)
  const result = await booksCollection.insertOne(data)
  res.send(result)
})

app.get('/books/:id', verifyToken, async(req , res)=>{
  const id = req.params.id
  const query = {_id : new ObjectId(id)}
  const result = await booksCollection.findOne(query)
  res.send(result)
})
app.get('/dltBooks/:id', async(req , res)=>{
  const id = req.params.id
  const query = {_id : new ObjectId(id)}
  const result = await booksCollection.findOne(query)
  res.send(result)
})
app.get('/updateBooks/:id', async(req , res)=>{
  const id = req.params.id
  const query = {_id : new ObjectId(id)}
  const result = await booksCollection.findOne(query)
  res.send(result)
})
app.patch('/updateBooks/:id',  async(req , res)=>{
  const id = req.params.id
  const data =req.body;
  const query = {_id : new ObjectId(id)}
  const update = {
    $set: {
      title : data.title ,
  author : data.author,
  genre : data.genre,
  rating : data.rating,
  summary : data.summary,
  coverImage : data.coverImage,
    }
  }
  const result = await booksCollection.updateOne(query , update) 
  res.send(result)
})
app.delete( '/dltBooks/:id',  async(req , res)=>{
 const id = req.params.id;
 const query = { _id: new ObjectId(id)}
 const result = await booksCollection.deleteOne(query)
 res.send(result)
})
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port , ()=>{
    console.log(`book haven server is running on port: ${port}`)
})

