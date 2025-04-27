import services from "../db/servicesQuery.js";

//homepage
const home = async (req, res) => {
  const servicesList = await services();

  console.log("services", servicesList); //debugging

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
    res.render("worker-profile", { user: req.session.user });
  } else {
    // Handling unexpected roles
    console.error("Unknown user role:", req.session.user.role); //debugging
    res.status(403).render("error", { message: "Unauthorized access" });
  }
};

export { home, register, login, logout, profile };
