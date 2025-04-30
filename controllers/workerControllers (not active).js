import { workerQueries } from "../db/workerQueries.js";

export const workerController = {
  getWorkerProfile: async (req, res) => {
    // try {
    //   const workerId = req.user.worker_id;
    //   const workerData = await workerQueries.getFullWorkerProfile(workerId);
    //   const services = await workerQueries.getWorkerServices(workerId);
    //     console.log("services",services); //debugging
    //   res.render('worker-profile', {
    //     user: {
    //       ...req.user,
    //       worker: workerData,
    //       services
    //     },
    //     statusClasses: {
    //       'Inasubiri': 'bg-yellow-100 text-yellow-800',
    //       'Imekubaliwa': 'bg-green-100 text-green-800',
    //       'Imekataliwa': 'bg-red-100 text-red-800'
    //     }
    //   });
    // } catch (error) {
    //   req.flash('error', 'Hitilafu katika kupakua profaili');
    //   res.redirect('/');
    // }
  },

  updateWorkerProfile: async (req, res) => {
    console.log("Update worker profile request body:", req.body); //debugging
    try {
      const workerId = req.session.user.workers[0].worker_id;
      console.log("worker id", workerId); //debugging
      const { full_name, location, phone, hourly_rate, experience_years } =
        req.body;

      //file handling------------start------------
      const file = req.body.file;
      if (!file) {
        return res.status(400).send("No file uploaded");
      }

      // Upload to Supabase
      const fileName = `${Date.now()}-${file.originalname}`;
      const { error } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(fileName);
      //-------------------------end----------------
      // Handle services array (convert to array if single value)
      let services = req.body.services;
      //   if (Array.isArray(req.body['services[]'])) {
      //     services = req.body['services[]'].map(Number).filter(id => !isNaN(id));
      //   } else if (req.body['services[]']) {
      //     services = [Number(req.body['services[]'])].filter(id => !isNaN(id));
      //   }

      // Update worker details
      await workerQueries.updateWorker(workerId, {
        full_name,
        location,
        phone,
        hourly_rate,
        experience_years,
      });
      console.log("services to feed", services); //debugging
      // Update worker services (pass array of service IDs)
      await workerQueries.updateWorkerServices(workerId, services);

      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      req.flash("success", "Profaili imesasishwa kikamilifu!");
      res.redirect("/profile");
    } catch (error) {
      console.error("Update error:", error);
      req.flash("error", "Hitilafu katika kuhifadhi mabadiliko");
      res.redirect("/profile");
    }
  },
};
