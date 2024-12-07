const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize App
const app = express();
const PORT = 5001;

// Temporary in-memory storage for sessions
const sessions = {};

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/socialweb') // Updated to remove deprecated options
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).send('User created successfully!');
  } catch (error) {
    res.status(400).send('Error creating user: ' + error.message);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      // Create a session
      sessions[username] = true;
      res.send('Login successful!');
    } else {
      res.status(401).send('Invalid credentials.');
    }
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
