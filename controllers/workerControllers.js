import { workerQueries } from '../db/workerQueries.js';

export const workerController = {
//   getWorkerProfile: async (req, res) => {
//     try {
//       const workerId = req.user.worker_id;
      
//       const workerData = await workerQueries.getFullWorkerProfile(workerId);
//       const services = await workerQueries.getWorkerServices(workerId);
//         console.log("services",services); //debugging
//       res.render('worker-profile', {
//         user: {
//           ...req.user,
//           worker: workerData,
//           services
//         },
//         statusClasses: {
//           'Inasubiri': 'bg-yellow-100 text-yellow-800',
//           'Imekubaliwa': 'bg-green-100 text-green-800',
//           'Imekataliwa': 'bg-red-100 text-red-800'
//         }
//       });
//     } catch (error) {
//       req.flash('error', 'Hitilafu katika kupakua profaili');
//       res.redirect('/');
//     }
//   },

  updateWorkerProfile: async (req, res) => {
    try {
      const workerId = req.user.worker_id;
      const { full_name, location, phone, hourly_rate, experience_years, services } = req.body;

      // Update worker details
      await workerQueries.updateWorker(workerId, {
        full_name,
        location,
        phone,
        hourly_rate,
        experience_years
      });

      // Update worker services
      await workerQueries.updateWorkerServices(workerId, services);

      req.flash('success', 'Profaili imesasishwa kikamilifu!');
      res.redirect('/profile/worker');
    } catch (error) {
      console.error('Update error:', error);
      req.flash('error', 'Hitilafu katika kuhifadhi mabadiliko');
      res.redirect('/profile/worker');
    }
  }
};

export default workerController;