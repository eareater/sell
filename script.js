const express = require('express');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Configure session store
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/session-store', // Replace with your MongoDB connection string
  collection: 'sessions'
});

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/file-downloads', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Configure file storage using multer
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const filename = `${Date.now()}_${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Define file and user models using Mongoose
const fileSchema = new mongoose.Schema({
  name: String,
  price: Number,
  filename: String
});

const File = mongoose.model('File', fileSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  balance: Number
});

const User = mongoose.model('User', userSchema);

// Set up session middleware
app.use(session({
  secret: 'your_secret_key', // Replace with your own secret key
  resave: false,
  saveUninitialized: true,
  store
}));

// Parse request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  const { name, price } = req.body;
  const { filename } = req.file;

  const file = new File({
    name,
    price,
    filename
  });

  file.save((err, savedFile) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.redirect('/files');
    }
  });
});

// Handle user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username, password }, (err, user) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else if (user) {
      req.session.username = username;
      res.redirect('/files');
    } else {
      res.sendStatus(401);
    }
  });
});

// Handle user logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Handle file listing and download
app.get('/files', (req, res) => {
  if (!req.session.username) {
    res.redirect('/');
    return;
  }

  File.find({}, (err, files) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.render('files', {
        username: req.session.username,
        files
      });
    }
  });
});

// Handle file purchase
app.get('/purchase/:id', (req, res) => {
  const { id } = req.params;

  if (!req.session.username) {
    res.redirect('/');
    return;
  }

  File.findById(id, (err, file) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else if (!file) {
      res.sendStatus(404);
    } else {
      User.findOne({ username: req.session.username }, (err, user) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else if (!user || user.balance < file.price) {
          res.sendStatus(403);
        } else {
          // Deduct the file price from the user's balance
          user.balance -= file.price;
          user.save();

          // Provide the file download
          const fileLocation = path.join(__dirname, 'uploads', file.filename);
          res.download(fileLocation);
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
