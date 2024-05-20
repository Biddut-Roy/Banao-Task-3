const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
// parser
app.use(bodyParser.json());
app.use(cookieParser());

const users = [];
const SECRET_KEY =
  "fa6fdaa9c1b0c424051431aaf7d3ecb137d036f264ca70d9b3374d47b504daf6109ce0cc7fe6ae1a1948585b05df2584ac37e064fcf09096a1e33d421f2126a7"; //change your secrete code

// Dummy data
let posts = [
  { id: 1, text: "Post 1", likes: 0, comments: [], email: "jack@gmail.com" },
  { id: 2, text: "Post 2", likes: 0, comments: [], email: "jack1@gmail.com" },
];

// Middleware to authenticate JWT
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }

  if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Register API
app.post("/register", async (req, res) => {
  const { email, password, username } = req.body;
  console.log(req.body);
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { email, password: hashedPassword, username };
  users.push(newUser);

  res.status(201).json({ message: "User successfully registered" });
});

// User Login API
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username/password" });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid username/password" });
  }

  // Generate a token
  const token = jwt.sign(
    { username: user.username, email: user.email },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: `User successfully logged in` });
});

// Forgot Password API
app.post("/forgotPassword", (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({ message: "Password reset email sent" });
});

// Example of a protected route
app.get("/profile", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}`, user: req.user });
});

// task 2 code:

// Get all posts
app.get("/posts", verifyToken, (req, res) => {
  res.json(posts);
});

// Access a get data by ID
app.get("/posts/:id", verifyToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find((post) => post.id === postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json(post);
});

// Create a new post
app.post("/posts", verifyToken, (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }
  const newPost = {
    id: posts.length + 1,
    text,
    likes: 0,
    comments: [],
    email: req.user.email,
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Like a post by ID
app.post("/posts/:id/like", verifyToken, (req, res) => {
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
app.post("/posts/:id/comments", verifyToken, (req, res) => {
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
