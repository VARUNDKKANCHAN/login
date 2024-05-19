const express = require('express');
const bcrypt = require('bcrypt');
const ejs = require('ejs');
const { body, validationResult } = require('express-validator');
const collection = require('./config'); // Ensure this is your MongoDB collection or equivalent
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

// Root route
app.get('/', (req, res) => {
  res.redirect('/login'); // Redirect to login page
});

// Render the login page with optional error message
app.get('/login', (req, res) => {
  const errorMessage = req.query.error || ''; // Get error message from query parameter
  res.render('login', { errorMessage }); // Pass errorMessage as an option
});

// Render the signup page with optional error message
app.get('/signup', (req, res) => {
  const errorMessage = req.query.error || ''; // Get error message from query parameter
  res.render('signup', { errorMessage }); // Pass errorMessage as an option
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
  body('password')
    .trim()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .custom(passwordValidator), // Add custom password validation
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg; // Get first error message
    return res.render('signup', { errorMessage }); // Render signup with error message
  }

  const { name, password } = req.body;
  try {
    const existingUser = await collection.findOne({ name });
    if (existingUser) {
      const errorMessage = 'User already exists';
      return res.render('signup', { errorMessage }); // Render signup with error message
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new collection({
      name,
      password: hashPassword,
    });

    const userData = await newUser.save();
    console.log('User Data:', userData); // Debugging statement

    res.send('User registered successfully');
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).send('Server error');
  }
});

// Handle login form submission
app.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg; // Get first error message
    return res.redirect(`/login?error=${errorMessage}`); // Redirect to login with error message
  }

  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      const errorMessage = 'Invalid username or password';
      return res.redirect(`/login?error=${errorMessage}`); // Redirect to login with error message
    } else {
      // Compare password
      const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
      if (isPasswordMatch) {
        res.render("home");
      } else {
        const errorMessage = 'Invalid username or password';
        return res.redirect(`/login?error=${errorMessage}`); // Redirect to login with error message
      }
    }
  } catch {
    res.redirect('/login?error=Server error'); // Redirect to login with generic error message
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
