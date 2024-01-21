const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// console.log('token', process.env.ACCESS_TOKEN_SECRET);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.52ba6.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // // Send a ping to confirm a successful connection

    const trainersCollection = client.db('KaFitnessTracker').collection('trainer');
    const usersCollection = client.db('KaFitnessTracker').collection('users');
    const galleryCollection = client.db('KaFitnessTracker').collection('gallery');

    app.get('/trainers', async (req, res) => {
      const result = await trainersCollection.find().toArray();
      res.send(result);
    })
    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send(token);
    })

    // jwt related middleware
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
    }

    // users related API
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
    // gallery related api
    app.get('/gallery', async (req, res) => {
      const images = await galleryCollection.find().limit(12).toArray();
      res.send(images);
    })
    app.get('/images', async (req, res) => {
      const { page } = req.query;
      const pageSize = 12;
      const skip = (page - 1) * pageSize;
      // const skip = pageSize;

      try {
        const images = await galleryCollection.find().skip(skip).limit(pageSize).toArray();
        res.send(images);
      } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    })

    // trainer related api
    app.get('/trainers', async (req, res) => {
      const result = await trainersCollection.find().toArray();
      res.send(result);
    })
    app.get('/trainers/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await trainersCollection.findOne(query);
      res.send(result);
    })

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('KA Fitness tracker is running')
})

app.listen(port, () => {
  console.log(`KA Fitness tracker is running on port ${port}`);
})