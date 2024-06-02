const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const ejs = require('ejs');
const { body, validationResult } = require('express-validator');
const collection = require('./config'); // Ensure this is your MongoDB collection or equivalent
const helmet = require('helmet');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET, // Use environment variable
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
}));
app.set('view engine', 'ejs');

// Middleware to generate and set nonce
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Helmet setup with CSP that includes nonce
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Middleware to check if user is authenticated
function checkAuth(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', (req, res) => {
  res.render('start');
});

app.get('/start', (req, res) => {
  res.render('start');
});

app.get('/check-login', (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.redirect('/index');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  const errorMessage = req.query.error || '';
  res.render('login', { errorMessage });
});

app.get('/signup', (req, res) => {
  const errorMessage = req.query.error || '';
  res.render('signup', { errorMessage });
});

app.get('/index', checkAuth, (req, res) => {
  res.render('index');
});

// Custom validation rule for password complexity
const passwordValidator = (value) => {
  if (!/[0-9]/.test(value)) {
    throw new Error('Password must contain at least one number (0-9)');
  }
  if (!/[A-Z]/.test(value)) {
    throw new Error('Password must contain at least one uppercase letter (A-Z)');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    throw new Error('Password must contain at least one special character');
  }
  return true;
};

// Handle signup form submission with custom password validation
app.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .custom(passwordValidator),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    return res.render('signup', { errorMessage });
  }

  const { name, password } = req.body;
  try {
    const existingUser = await collection.findOne({ name });
    if (existingUser) {
      const errorMessage = 'User already exists';
      return res.render('signup', { errorMessage });
    }

    const saltRounds = 12; // Increased rounds for better security
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new collection({
      name,
      password: hashPassword,
    });

    const userData = await newUser.save();
    console.log('User Data:', userData);

    res.send('User registered successfully');
  } catch (error) {
    console.error('Error in signup:', error);
    next(error);
  }
});

// Handle login form submission
app.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    return res.redirect(`/login?error=${errorMessage}`);
  }

  try {
    const user = await collection.findOne({ name: req.body.username });
    if (!user) {
      const errorMessage = 'Invalid username or password';
      return res.redirect(`/login?error=${errorMessage}`);
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (isPasswordMatch) {
      req.session.user = user;
      res.redirect('/index');
    } else {
      const errorMessage = 'Invalid username or password';
      return res.redirect(`/login?error=${errorMessage}`);
    }
  } catch (error) {
    next(error);
  }
});

// Handle logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// Error handling middleware (placed after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use(express.static('src/public'));


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
