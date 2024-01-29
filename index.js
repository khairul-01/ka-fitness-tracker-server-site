const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
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
    const appliedTrainersCollection = client.db('KaFitnessTracker').collection('appliedTrainers');
    const usersCollection = client.db('KaFitnessTracker').collection('users');
    const galleryCollection = client.db('KaFitnessTracker').collection('gallery');
    const forumPostsCollection = client.db('KaFitnessTracker').collection('forumPosts');
    const blogsCollection = client.db('KaFitnessTracker').collection('blogs');
    const classesCollection = client.db('KaFitnessTracker').collection('classes');
    const subscribersCollection = client.db('KaFitnessTracker').collection('subscribers');

    // Trainer related api
    app.get('/trainers', async (req, res) => {
      const result = await trainersCollection.find().toArray();
      res.send(result);
    })
    app.post('/appliedTrainers', async (req, res) => {
      const trainer = req.body;
      const result = await appliedTrainersCollection.insertOne(trainer);
      res.send(result);
    })
    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log('The token ', token);
      res.send(token);
    })

    // jwt related middleware
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'Unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    // users related API
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const result = await usersCollection.findOne(query);
      res.send(result);
    })
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
    // blogs related api
    app.get('/blogs', async (req, res) => {
      const images = await blogsCollection.find().toArray();
      res.send(images);
    })

    app.get('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);
      res.send(result);
    })

    // subscription related api
    app.post('/subscriber', async (req, res) => {
      const subscriber = req.body;
      console.log( "subscriber", subscriber);
      const query = { email: subscriber.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null })
      }
      const result = await subscribersCollection.insertOne(subscriber);
      res.send(result);
    })

    app.get("/subscriber", async (req, res) => {
      const result = await subscribersCollection.find().toArray();
      res.send(result);
    })

    // trainer related api
    app.get('/trainers', async (req, res) => {
      const result = await trainersCollection.find().toArray();
      res.send(result);
    })
    app.get('/trainers/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await trainersCollection.findOne(query);
      res.send(result);
    })

    // Forum related api
    app.get('/forumPosts', async (req, res) => {
      const result = await forumPostsCollection.find().toArray();
      res.send(result);
    })

    // class related api
    app.get('/classes', async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

    // Payment related API
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, 'inside intent');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'aud',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      })
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