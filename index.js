const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const users = [];

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
