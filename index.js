const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// KaFitnessTracker
// UZCsHXs0mNMr3WmD

app.get('/', (req, res) => {
    res.send('KA Fitness tracker is running')
})

app.listen(port, () => {
    console.log(`KA Fitness tracker is running on port ${port}`);
})