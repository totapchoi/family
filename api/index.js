const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors')
const fs = require('fs');
// Check if the images folder exists
if (!fs.existsSync('images')) {
  // If the images folder doesn't exist, create it
  fs.mkdirSync('images');
}
// Initialize Express and set up the port
const app = express();
const port = 3000;

// Set up folder images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });
// Set up JWT key
const key = 'LDKLADKFLJDF';

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Serve static files from the 'images' folder
app.use('/api/images', express.static(path.join(__dirname, 'images')));


// Define authentication middleware
function authMiddleware(req, res, next) {
  if (req.path === '/api/auth/signin' || req.path === '/api/signup') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1]; // The token is after the 'Bearer ' part

  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }


    req.user = decoded;
    next();
  });
}

// Use the authentication middleware
app.use(authMiddleware);

// Function to generate JWT token
function generateToken(userId, userEmail) {
  const payload = { id: userId, email: userEmail };
  const token = jwt.sign(payload, key, { expiresIn: '1h' });
  return token;
}

// Set up SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.get('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table" AND name="User"', (err, row) => {
  if (err) {
    console.error(err.message);
  } else {
    // If table does not exist, create table and add user
    if (row.count === 0) {
      db.run(`
        CREATE TABLE User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        firstName TEXT,
        lastName TEXT,
        password TEXT,
        person_id INTEGER
        )
        `, (err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log('User table created.');
        }
      });
    }
  }
});

// Check if Person table exists
db.get('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table" AND name="Person"', (err, row) => {
  if (err) {
    console.error(err.message);
  } else {
    // If table does not exist, create table and add persons
    if (row.count === 0) {
      db.run(`
        CREATE TABLE Person (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        gender TEXT,
        birthyear TEXT,
        living INTEGER CHECK (living IN (0, 1)),
        public INTEGER CHECK (living IN (0, 1)),
        partner_id INTEGER,
        family_id INTEGER,
        image TEXT
        )
        `, (err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log('Person table created.');

        }
      });
    }
  }

  // Create the Family table
  db.run(`
CREATE TABLE IF NOT EXISTS Family (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
)
`, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Family table created.');


    }
  });
  // Create the Parent table
  // Check if Parent table exists
  db.get('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table" AND name="Parent"', (err, row) => {
    if (err) {
      console.error(err.message);
    } else {
      // If table does not exist, create table and add parent-child relationships
      if (row.count === 0) {
        db.run(`
        CREATE TABLE Parent (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER,
        child_id INTEGER,
        family_id INTEGER
        )
        `, (err) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log('Parent table created.');

          }
        });
      }
    }
  });


});

// Users routes
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM User', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(rows);
  });
});

app.get('/api/currentUser', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.get(`
    SELECT * FROM User WHERE id = ?
  `, [req.user.id], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows)
  })
});

// Signin/Signup routes
app.post('/api/signup', (req, res) => {
  const { email, firstName, lastName, password, repassword } = req.body;

  // Insert the user into the User table
  db.run(`
    INSERT INTO User (email, firstName, lastName, password)
    VALUES (?, ?, ?, ?)
  `, [email, firstName, lastName, password], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    const userId = this.lastID;

    // Insert the person into the Person table
    db.run(`
      INSERT INTO Person (firstname, lastname)
      VALUES (?, ?)
    `, [firstName, lastName], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
      const personId = this.lastID;

      // Update the user's person_id
      db.run(`
        UPDATE User SET person_id = ? WHERE id = ?
      `, [personId, userId], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }

        const user = {
          id: userId,
          email,
          firstName,
          lastName,
          person_id: personId
        };
        res.json(user);
      });
    });
  });
});


app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;

  db.get(`
      SELECT id, email
      FROM User
      WHERE email = ? AND password = ?
      `, [email, password], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (row) {
      const token = generateToken(row.id, row.email);
      res.json({ token });
    } else {
      res.status(400).json({ signin: false });
    }
  });
});

// Person routes

// Fetch all persons
app.get('/api/persons', (req, res) => {
  db.all('SELECT * FROM Person', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

// Fetch a person based on ID
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM Person WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });

    }
    if (!row) {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.json(row);


  });
});
// Add a person
app.post('/api/persons', upload.single('image'), (req, res) => {
  const { firstName, lastName, gender, birthyear, living, public } = req.body;
  const image = req.file.filename; // Get the uploaded file name

  // Convert living and public to their numeric representations
  const livingNum = living === "living" ? 1 : 0;
  const publicNum = public === "public" ? 1 : 0;

  db.run(`
    INSERT INTO Person (firstname, lastname, gender, birthyear, living, public, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [firstName, lastName, gender, birthyear, livingNum, publicNum, image], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ message: 'Person added successfully' });
  });
});

// Update a person based on ID
app.put('/api/persons/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;
  const { firstName, lastName, gender, birthyear, living, public } = req.body;
  const image = req.file ? req.file.filename : undefined;

  // Convert living and public to their numeric representations
  const livingNum = living === "living" ? 1 : 0;
  const publicNum = public === "public" ? 1 : 0;

  db.run(
    'UPDATE Person SET firstname = ?, lastname = ?, gender = ?, birthyear = ?, living = ?, public = ?, image = ? WHERE id = ?',
    [firstName, lastName, gender, birthyear, livingNum, publicNum, image, id],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Person not found' });
      }
      res.json({ message: 'Person updated successfully' });
    }
  );
});


// Delete a person based on ID
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM Person WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.json({ message: 'Person deleted successfully' });
  });
});

// Add a person and create a parent record
app.post('/api/parent/:id', upload.single('image'), (req, res) => {
  const { firstName, lastName, gender, birthyear, living, public } = req.body;
  const image = req.file ? req.file.filename : undefined; // Get the uploaded file name
  const childId = req.params.id; // Get the child id from the URL

  // Convert living and public to their numeric representations
  const livingNum = living === "living" ? 1 : 0;
  const publicNum = public === "public" ? 1 : 0;

  db.run(`
    INSERT INTO Person (firstname, lastname, gender, birthyear, living, public, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [firstName, lastName, gender, birthyear, livingNum, publicNum, image], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const parentId = this.lastID; // Capture the lastID value here

    // Update the family_id of the child to match the parent's family_id
    db.run(`
      UPDATE Person
      SET family_id = (SELECT family_id FROM Person WHERE id = ?)
      WHERE id = ?
    `, [childId, parentId], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Insert the parent record into the Parent table
      db.run(`
        INSERT INTO Parent (parent_id, child_id, family_id)
        VALUES (?, ?, (SELECT family_id FROM Person WHERE id = ?))
      `, [parentId, childId, childId], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Send a success response to the client
        return res.status(200).json({ message: 'Person and parent record added successfully' });
      });
    });
  });
});


// Add a person and create a child record
app.post('/api/child/:id', upload.single('image'), (req, res) => {
  const { firstName, lastName, gender, birthyear, living, public } = req.body;
  const image = req.file ? req.file.filename : undefined; // Get the uploaded file name
  const parentId = req.params.id; // Get the parent id from the URL

  // Convert living and public to their numeric representations
  const livingNum = living === "living" ? 1 : 0;
  const publicNum = public === "public" ? 1 : 0;

  db.get(`
    SELECT partner_id FROM Person WHERE id = ?
  `, [parentId], function (err, row) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const partnerId = row ? row.partner_id : undefined;

    db.run(`
      INSERT INTO Person (firstname, lastname, gender, birthyear, living, public, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [firstName, lastName, gender, birthyear, livingNum, publicNum, image], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const childId = this.lastID; // Capture the lastID value here

      db.run(`
      UPDATE Person
      SET family_id = (SELECT family_id FROM Person WHERE id = ?)
      WHERE id = ?
    `, [parentId, childId], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }
      });

      // Insert the child record into the Parent table
      db.run(`
        INSERT INTO Parent (parent_id, child_id, family_id)
        VALUES (?, ?, (SELECT family_id FROM Person WHERE id = ?))
      `, [parentId, childId, parentId], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }
        console.log("Children record inserted");

        // If partnerId exists, insert it as a parent of the child
        if (partnerId !== undefined) {
          db.run(`
            INSERT INTO Parent (parent_id, child_id, family_id)
            VALUES (?, ?, (SELECT family_id FROM Person WHERE id = ?))
          `, [partnerId, childId, partnerId], function (err) {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ error: 'Internal server error' });
            }
            console.log("Partner record inserted");
          });
        }

        // Send a success response to the client
        return res.status(200).json({ message: 'Person and child record added successfully' });
      });

    });
  });
});


app.post('/api/partner/:id', upload.single('image'), (req, res) => {
  const { firstName, lastName, gender, birthyear, living, public } = req.body;
  const image = req.file ? req.file.filename : undefined;
  const partnerId = req.params.id; // Get the partner id from the URL

  // Convert living and public to their numeric representations
  const livingNum = living === "living" ? 1 : 0;
  const publicNum = public === "public" ? 1 : 0;

  db.run(`
  INSERT INTO Person (firstname, lastname, gender, birthyear, living, public, image)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`, [firstName, lastName, gender, birthyear, livingNum, publicNum, image], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const newPartnerId = this.lastID; // Capture the lastID value here

    // Update the partner_id for both persons
    db.run(`
    UPDATE Person SET partner_id = ? WHERE id = ?
  `, [newPartnerId, partnerId], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      db.run(`
      UPDATE Person SET partner_id = ? WHERE id = ?
    `, [partnerId, newPartnerId], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Update the new partner's family_id
        db.run(`
        UPDATE Person SET family_id = (SELECT family_id FROM Person WHERE id = ?) WHERE id = ?
      `, [partnerId, newPartnerId], function (err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
          }

          // Check the parent table for any children of the partner and add the parent-child relationship to the new partner
          db.run(`
          INSERT INTO Parent (parent_id, child_id, family_id)
          SELECT ?, child_id, family_id FROM Parent WHERE parent_id = ?
        `, [newPartnerId, partnerId], function (err) {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ error: 'Internal server error' });
            }
            // Check the parent table for any parent of the partner and add the parent-child relationship to the new partner
            db.run(`
            INSERT INTO Parent (parent_id, child_id, family_id)
            SELECT parent_id, ?, family_id FROM Parent WHERE child_id = ?
            `, [newPartnerId, partnerId], function (err) {


              // Send a success response to the client
              return res.status(200).json({ message: 'Partner added successfully' });
            });
          });
        });
      });
    });
  });
});
// Search person:
app.get('/api/person/search', (req, res) => {
  const searchStr = req.query.query;

  db.all(`SELECT * FROM Person WHERE firstName LIKE '%${searchStr}%' OR lastName LIKE '%${searchStr}%'`, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(rows);
  });
});
// Get parents:
app.get('/api/person/parent/:id', (req, res) => {
  const id = req.params.id;

  db.all(`SELECT * FROM Person WHERE id IN (SELECT parent_id FROM Parent WHERE child_id = ?)`, [id], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log(rows);
    res.json(rows);
  })
})

//Get Children:
app.get('/api/person/children/:id', (req, res) => {
  const id = req.params.id;

  db.all(`SELECT * FROM Person WHERE id IN (SELECT child_id FROM Parent WHERE parent_id = ?)`, [id], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(rows);
  })
})

// Family routes

// Add a family
app.post('/api/family/:id', (req, res) => {
  const id = req.params.id;

  // Fetch the person's name with their ID
  db.get('SELECT firstName, lastName FROM Person WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Construct the family name using the person's name
    const familyName = `${row.lastName} ${row.firstName}'s family`;

    // Insert the family with the constructed name
    db.run(`
      INSERT INTO Family (name) VALUES (?)
    `, [familyName], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const family_id = this.lastID;

      // Update the person's family_id
      db.run(`
        UPDATE Person SET family_id = ? WHERE id = ?
      `, [family_id, id], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }

        return res.status(200).json({ family_id: family_id });
      });
    });
  });
});



// Fetch all persons from a family
app.get('/api/familyTree/:id', (req, res) => {
  const familyId = req.params.id;

  // Query to fetch all persons in a family
  db.all('SELECT * FROM Person WHERE family_id = ?', [familyId], (err, persons) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Query to fetch all parent-child relationships in a family
    db.all('SELECT * FROM Parent WHERE family_id = ?', [familyId], (err, parentRelations) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(200).json({ persons, parentRelations });
    });
  });
});
// Get family's name
app.get('/api/family/:id/name', (req, res) => {
  const id = req.params.id;

  // Fetch the family name with the given ID
  db.get('SELECT name FROM Family WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Family not found' });
    }
    return res.status(200).json({ name: row.name });
  });
});
// Edit family name:
app.put('/api/family/:id/name', (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  // Update the family name with the given ID
  db.run('UPDATE Family SET name = ? WHERE id = ?', [name, id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Family not found' });
    }

    return res.status(200).json({ message: 'Family name updated successfully' });
  });
});



// Start the Express server
app.listen(port, () => {
  console.log(`API server is running at http://localhost:${port}`);
});
