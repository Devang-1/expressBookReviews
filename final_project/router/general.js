const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL for Axios calls
const BASE_URL = 'http://localhost:5000';  // Make sure this matches your local server port!

// ✅ Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

// ✅ Task 1: Get all books (Sync version)
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// ✅ Task 2: Get book details based on ISBN (Sync version)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// ✅ Task 3: Get book details by author (Sync version)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  for (let key in books) {
    if (books[key].author === author) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// ✅ Task 4: Get book details by title (Sync version)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  for (let key in books) {
    if (books[key].title === title) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// ✅ Task 5: Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

// ✅ Task 10: Get list of books using Async/Await
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// ✅ Task 11: Get book details by ISBN using Async/Await
public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "Book not found via async call", error: error.message });
  }
});

// ✅ Task 12: Get book details by author using Async/Await
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const books = response.data;
    const filtered = [];

    for (let key in books) {
      if (books[key].author === author) {
        filtered.push({ isbn: key, ...books[key] });
      }
    }

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching author data", error: error.message });
  }
});

// ✅ Task 13: Get book details by title using Async/Await
public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const books = response.data;
    const filtered = [];

    for (let key in books) {
      if (books[key].title === title) {
        filtered.push({ isbn: key, ...books[key] });
      }
    }

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching title data", error: error.message });
  }
});

module.exports.general = public_users;
