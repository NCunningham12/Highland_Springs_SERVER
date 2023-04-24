const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config()

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// Adding New Members
app.post('/add-member', (req, res) => {
  const first = req.body.first;
  const last = req.body.last;
  const handicap = req.body.handicap;
  const address = req.body.address;
  const phone = req.body.phone;
  const email = req.body.email;
  const memberSince = req.body.memberSince;

  db.query(
    'INSERT INTO members (first, last, handicap, address, phone, email, member_since) VALUES (?,?,?,?,?,?,?)',
    [first, last, handicap, address, phone, email, memberSince],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send('Member Added');
      }
    }
  );
});

// Getting Member usernames/passwords
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Sign-up
app.post('/users', async (req, res) => {
  try {
    const firstName = req.body.first;
    const lastName = req.body.last;
    const username = req.body.username;
    const password = req.body.password;

    db.query(
      'INSERT INTO users (first, last, username, password) VALUES (?,?,?,?)',
      [firstName, lastName, username, password],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send('User Created');
        }
      }
    );
  } catch {
    res.status(500).send();
  }
});

// Login
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (error, results) => {
        if (error) {
          throw error;
        }
        if (results.length > 0) {
          // Authenticate user
          res.send('User Authenticated');
          console.log('User Authenticated');
        } else {
          res.send('Incorrect username and/or password');
        }
      }
    );
  }
});

app.listen(3001, () => {
  console.log('Server Running on Port 3001');
});
