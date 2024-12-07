const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5001;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/social_web", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const postSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: "User signed up successfully", user: newUser });
  } catch (err) {
    res.status(400).json({ error: "Signup failed. Username might already exist." });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.status(200).json({ message: "Login successful", user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/posts", async (req, res) => {
  const { username, content } = req.body;
  try {
    const post = new Post({ username, content });
    await post.save();
    res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    res.status(400).json({ error: "Failed to create post" });
  }
});

app.get("/posts/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const posts = await Post.find({ username }).sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );
    if (updatedPost) {
      res.status(200).json({ message: "Post updated successfully", post: updatedPost });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (err) {
    res.status(400).json({ error: "Failed to update post" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPost = await Post.findByIdAndDelete(id);
    if (deletedPost) {
      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (err) {
    res.status(400).json({ error: "Failed to delete post" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
