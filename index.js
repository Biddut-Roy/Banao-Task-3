const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const users = [];

// Dummy data
let posts = [
  { id: 1, text: "Post 1", likes: 0, comments: [] },
  { id: 2, text: "Post 2", likes: 0, comments: [] },
];

app.post("/register", (req, res) => {
  const { email, password, username } = req.body;

  console.log(req.body);

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }
  const newUser = { email, password, username };
  users.push(newUser);

  res.status(200).json({ message: "User successfully registered" });
});

// User Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  const user = users.find((user) => user.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid username/password" });
  }

  res.status(200).json({ message: "User successfully logged in" });
});

app.post("/forgotPassword", (req, res) => {
  const { email } = req.body;

  console.log(req.body);

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({ message: "Password reset email sent" });
});

// task 2 code:

// Get all posts
app.get("/posts", (req, res) => {
  res.json(posts);
});

// Access a get data by ID
app.get("/posts/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find((post) => post.id === postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json(post);
});

// Create a new post
app.post("/posts", (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }
  const newPost = {
    id: posts.length + 1,
    text,
    likes: 0,
    comments: [],
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Like a post by ID
app.post("/posts/:id/like", (req, res) => {
  const postId = parseInt(req.params.id);
  // console.log(postId);   check id
  const post = posts.find((post) => post.id === postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  post.likes++;
  res.json(post);
});

// Add a comment to a post by Id
app.post("/posts/:id/comments", (req, res) => {
  const postId = parseInt(req.params.id);
  // console.log(postId);   check id
  const post = posts.find((post) => post.id === postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }
  const newComment = {
    text,
  };
  post.comments.push(newComment);
  res.status(201).json(post.comments);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
