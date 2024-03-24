const express = require('express');
const session = require('express-session');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

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
app.post('/sign-up', async (req, res) => {
  const { first, last, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    db.query(
      'INSERT INTO users (first, last, username, password) VALUES (?, ?, ?, ?)',
      [first, last, username, hashedPassword]
    );
    res.status(201).send('User successfully registered!');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) {
        throw err;
      }

      if (results.length === 0) {
        res.status(401).json({ message: 'Invalid username or password' });
      }

      const user = results[0];
      const hashedPassword = user.password;

      const match = await bcrypt.compare(password, hashedPassword);

      if (match) {
        req.session.user = {
          id: user.id,
          first: user.first,
          last: user.last,
          username: user.username,
        };
        res.status(200).json({
          message: 'Login successful',
          first_name: req.session.first,
          last_name: req.session.last,
          user: req.session.user,
        });
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
    }
  );
});

//Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Member List
app.get('/members', (req, res) => {
  db.query('SELECT * FROM members ORDER BY last', (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get('/members-handicap', (req, res) => {
  db.query('SELECT * FROM members ORDER BY handicap', (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get('/members/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM members WHERE id = ?', id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Update Member Info
app.put('/members/:id', (req, res) => {
  const id = req.params.id;
  const handicap = req.body.handicap;

  db.query(
    'UPDATE members SET handicap = ? WHERE id = ?',
    [handicap, id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

// Delete Member
app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM members WHERE id = ?', id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
