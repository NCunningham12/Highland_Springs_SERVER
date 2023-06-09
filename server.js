const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  bcrypt.hash(password, 10).then((hash) => {
    db.promise()
      .query(
        'INSERT INTO users (first, last, username, password) VALUES (?,?,?,?)',
        [first, last, username, hash]
      )
      .then(() => {
        res.json('USER REGISTERED');
      })
      .catch((err) => {
        if (err) {
          res.status(400).json({ error: err });
        }
      });
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = db.query(
    'SELECT username FROM users WHERE username = ?',
    [username],
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        console.log(results[0].username);
        return results[0].username;
      }
    }
  );

  if (!user) {
    res.status(400).json({ error: 'User does not exist' });
  }

  res.json('Successful Login');
});

// if (username && password) {
//   db.query(
//     'SELECT * FROM users WHERE username = ? AND password = ?',
//     [username, password],
//     (error, results) => {
//       if (error) {
//         throw error;
//       }
//       if (results.length > 0) {
//         // Authenticate user
//         res.send('User Authenticated');
//         console.log('User Authenticated');
//       } else {
//         res.send('Incorrect username and/or password');
//       }
//     }
//   );
// }

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
