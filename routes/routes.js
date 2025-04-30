import services from "../db/servicesQuery.js";
import { workerQueries } from "../db/workerQueries.js";
import { clientQueries } from "../db/clientQueries.js";

//homepage
const servicesList = await services();

const home = async (req, res) => {
  console.log("services profile", servicesList); //debugging
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0",
  });
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

//service searching page
// const servicesFind = async (req, res) => {
//   // console.log("services profile", servicesList); //debugging

//   res.render("service-search");
// };

//profiles

const profile = async (req, res, next) => {
  // const workerId = req.session.user.workers[0].worker_id;
  // const workerData = await workerQueries.getFullWorkerProfile(workerId);
  // console.log("worker services", workerData.services); //debugging
  console.log("Session:", req.session); // Debug session
  console.log("User:", req.session.user); // Debug user object

  if (!req.session || !req.session.user) {
    console.log("No valid user session found - redirecting to login");
    return res.redirect("/");
  }

  // Checking role and render appropriate profile
  if (req.session.user.role === "client") {
    console.log("client details", req.session.user); //debugging

    const clientId = req.session.user.clients[0].client_id;
    const clientData = await clientQueries.getFullClientProfile(clientId);
    console.log("client data", clientData); //debugging

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.render("client-profile", {
      user: req.session.user,
      client: clientData,
    });
  } else if (req.session.user.role === "worker") {
    const workerId = req.session.user.workers[0].worker_id;
    const workerData = await workerQueries.getFullWorkerProfile(workerId);

    console.log("worker services", workerData.services); //debugging

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
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

//update worker profile
const updateWorker = (req, res, next) => {
  console.log("update form submitted:", req.body); // Debug log
  next();
};

//update client profile
const updateClient = (req, res, next) => {
  console.log("update form submitted:", req.body); // Debug log
  next();
};

export { home, register, login, logout, profile, updateWorker, updateClient };
