import express from "express";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import { authController } from "../controllers/authControllers.js";
import flash from "express-flash";
import { error } from "console";
import services from "../db/servicesQuery.js";
import {home, register, login, logout,profile, updateWorker, updateClient} from "../routes/routes.js";
import {workerController} from "../controllers/workerControllers.js";
import { clientController } from "../controllers/clientControllers.js";
import { ServiceSearchController } from "../controllers/serviceSearchControllers.js";
import { createClient } from "@vercel/kv";
import { Store } from "express-session";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

//initialize vercel kv
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// Custom Vercel KV session store
class VercelKVStore extends Store {
  constructor(kvClient) {
    super();
    this.kv = kvClient;
  }

  async get(sid, callback) {
    try {
      const data = await this.kv.get(`sess:${sid}`);
      if (!data) {
        return callback(null, null);
      }
      // Handle both string and object data
      if (typeof data === "object") {
        // Data is already an object, no need to parse
        return callback(null, data);
      }
      if (typeof data !== "string") {
        console.error(`Invalid session data type for sid ${sid}:`, typeof data);
        return callback(null, null);
      }
      try {
        const parsed = JSON.parse(data);
        callback(null, parsed);
      } catch (parseErr) {
        console.error(`Failed to parse session data for sid ${sid}:`, parseErr.message);
        callback(null, null);
      }
    } catch (err) {
      callback(err);
    }
  }

  async set(sid, session, callback) {
    try {
      // Ensure session is a valid object before stringifying
      if (!session || typeof session !== "object") {
        console.error(`Invalid session object for sid ${sid}:`, session);
        return callback(new Error("Invalid session object"));
      }
      const serialized = JSON.stringify(session);
      await this.kv.set(`sess:${sid}`, serialized, { ex: 24 * 60 * 60 });
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await this.kv.del(`sess:${sid}`);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

// Middleware setup
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration - must come before CSRF
app.use(session({
  store: new VercelKVStore(kv), // Use the custom Vercel KV store
  secret: process.env.SESSION_SECRET || "your-secret-key", 
  resave: false, 
  saveUninitialized: true, // Changed to true to set cookie immediately
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
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

const router = express.Router();

//profile routes
router.get('/profile', profile);
router.post('/profile/worker/update',updateWorker, workerController.updateWorkerProfile);
router.post('/profile/client/update',updateClient, clientController.updateClientProfile);

// router.get('/profile', profile);
router.post('/register', register, authController.registerUser);
router.post('/login', login, authController.loginUser);
router.post('/logout', logout, authController.logoutUser);

//search services router
router.get('/client/services/find', ServiceSearchController.getFullWorkers);

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

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});

export default app;