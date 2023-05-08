// Importing required modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app and set the port
const app = express();
const PORT = process.env.PORT || 3001;

// Set up middleware for parsing request body and serving static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Route for notes.html
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// API route for getting all notes
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error reading notes' });
    }
    res.json(JSON.parse(data));
  });
});

// API route for posting a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4();

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error reading notes' });
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error saving note' });
      }
      res.json(newNote);
    });
  });
});

// API route for deleting a note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error reading notes' });
    }

    let notes = JSON.parse(data);
    notes = notes.filter((note) => note.id !== noteId);

    fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error deleting note' });
      }
      res.json({ message: 'Note deleted' });
    });
  });
});

// Route for handling all other requests and serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}`);
});