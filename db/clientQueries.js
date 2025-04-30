import supabase from "../db/pool.js";

export const clientQueries = {
  getFullClientProfile: async (clientId) => {
    const { data, error } = await supabase
      .from("clients")
      .select(`*`)
      .eq("client_id", clientId)
      .single();

    if (error) throw error;
    return data;
  },

  updateClient: async (clientId, updates) => {
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("client_id", clientId)
      .select();

    if (error) throw error;
    return data;
  }
};
