import { workerQueries } from "../db/workerQueries.js";

export const ServiceSearchController = {
  getFullWorkers: async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.role !== "client") {
      console.log("No valid user session found - redirecting to login");
      return res.redirect("/");
    }
    try {
      const workerData = await workerQueries.getFullWorkersProfile();
      //   const services = await workerQueries.getWorkerServices(workerId);
      // console.log("servicesSearch", workerData[1].user); //debugging
      res.render("service-search", {
        workers: workerData,
        // statusClasses: {
        //   Inasubiri: "bg-yellow-100 text-yellow-800",
        //   Imekubaliwa: "bg-green-100 text-green-800",
        //   Imekataliwa: "bg-red-100 text-red-800",
        // },
      });
    } catch (error) {
      req.flash("error", "Hitilafu katika kupakua profaili");
      res.redirect("/");
    }
  },
};
