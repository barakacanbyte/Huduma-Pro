import express from "express";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import { authController } from "./controllers/authControllers.js";
import flash from "express-flash";
import { error } from "console";
import services from "./db/servicesQuery.js";
import {home, register, login, logout, profile} from "./routes/routes.js";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

// Middleware setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration - must come before CSRF
app.use(session({ 
  secret: process.env.SESSION_SECRET || "your-secret-key", 
  resave: false, 
  saveUninitialized: true, // Changed to true to set cookie immediately
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Initialize passport after session
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// CSRF protection setup
const { 
  generateToken, // Use this to generate tokens
  doubleCsrfProtection, // Use this as middleware
  invalidCsrfTokenError // Use this to handle invalid tokens
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "your-secret-key",
  cookieName: "x-csrf-token", // Simplified cookie name
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === 'production'
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

// Apply CSRF middleware to all routes that need protection
app.use((req, res, next) => {
  res.locals.csrfToken = generateToken(req, res);
  next();
});

//Routes
app.get('/', home); //main route
// app.get('/profile', profile);  //profile route

//temporary post routes, awaiting csrf token debugging
const router = express.Router();

//profile route
router.get('/profile', profile);

// router.get('/profile', profile);
router.post('/register', register, authController.registerUser);
router.post('/login', login, authController.loginUser);
router.post('/logout', logout, authController.logoutUser)

app.use(router);

// Protected routes---to be debbuged
// app.post('/login', doubleCsrfProtection, authController.loginUser);
// app.post('/register', doubleCsrfProtection, authController.registerUser);

// Error handling for invalid CSRF tokens
app.use((err, req, res, next) => {
  if (err === invalidCsrfTokenError) {
    res.status(403).json({
      error: "Invalid CSRF token"
    });
  } else {
    next(err);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});