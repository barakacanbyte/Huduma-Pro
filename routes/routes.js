import services from "../db/servicesQuery.js";
import { workerQueries } from "../db/workerQueries.js";

//homepage
const servicesList = await services();

const home = async (req, res) => {
  console.log("services profile", servicesList); //debugging

  res.render("main", {
    user: req.user || req.session.user,
    services: servicesList || [],
    error: req.flash("error")[0],
    errors: req.flash("errors"),
  });
};

//Auths
const register = (req, res, next) => {
  console.log("Registration form submitted:", req.body); // Debug log
  next();
};

const login = (req, res, next) => {
  console.log("Login form submitted:", req.body); // Debug log
  next();
};

const logout = (req, res, next) => {
  next();
};

//profiles

const profile = async (req, res, next) => {
  const workerId = req.session.user.workers[0].worker_id;
  const workerData = await workerQueries.getFullWorkerProfile(workerId);
  console.log("worker services", workerData.services[0].services.service_name); //debugging
  console.log("Session:", req.session); // Debug session
  console.log("User:", req.session.user); // Debug user object

  if (!req.session.user) {
    console.log("No user found - redirecting to login");
    return res.redirect("/login");
  }

  // Checking role and render appropriate profile
  if (req.session.user.role === "client") {
    res.render("client-profile", { user: req.session.user });
  } else if (req.session.user.role === "worker") {
    res.render("worker-profile", {
      user: req.session.user,
      allServices: servicesList,
      services: workerData.services,
    });
  } else {
    // Handling unexpected roles
    console.error("Unknown user role:", req.session.user.role); //debugging
    res.status(403).render("error", { message: "Unauthorized access" });
  }
};

export { home, register, login, logout, profile };
