const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username is valid (not empty and exists in the users array)
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    // Check if username and password match the records
    return users.some(user => user.username === username && user.password === password);
};

// Secret key for JWT signing
const JWT_SECRET = 'your_jwt_secret_key';

// Register a new user (for testing purposes)
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    if (isValid(username)) {
        return res.status(400).json({ message: "Username already exists." });
    }

    // Add the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});

// Login route for registered users
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // Create JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    // Save the token in the session (here we use the response object for simplicity)
    res.cookie('auth_token', token, { httpOnly: true });

    return res.status(200).json({ message: "Login successful.", token });
});

// Middleware to authenticate the user based on JWT
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }

        req.user = user;
        next();
    });
};

// Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;

    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    // Find the book and its existing reviews
    let book = books.find(book => book.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the user has already reviewed this book
    let existingReview = book.reviews.find(r => r.username === req.user.username);
    if (existingReview) {
        // Modify the existing review
        existingReview.review = review;
        return res.status(200).json({ message: "Review updated successfully." });
    } else {
        // Add a new review
        book.reviews.push({ username: req.user.username, review });
        return res.status(201).json({ message: "Review added successfully." });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const { isbn } = req.params;

    // Find the book and its reviews
    let book = books.find(book => book.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Find the review of the logged-in user
    let reviewIndex = book.reviews.findIndex(r => r.username === req.user.username);
    if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found." });
    }

    // Delete the review
    book.reviews.splice(reviewIndex, 1);
    return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
