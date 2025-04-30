import { clientQueries } from "../db/clientQueries.js";

export const clientController = {
  updateClientProfile: async (req, res) => {
    console.log("Update client profile request body:", req.body); //debugging
    try {
      const clientId = req.session.user.clients[0].client_id;
      console.log("client id", clientId); //debugging
      const { full_name, location, phone } =
        req.body;

      // Update worker details
      await clientQueries.updateClient(clientId, {
        full_name,
        location,
        phone
      });

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
