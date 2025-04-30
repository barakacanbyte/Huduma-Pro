import supabase from '../db/pool.js';

export const workerQueries = {
  getFullWorkersProfile: async () => {
    const { data, error } = await supabase
      .from('workers')
      .select(`
      worker_id,
      full_name,
       services:worker_services(
        service_id,
        services(
        service_name
        )
      ),
      location,
      experience_years,
      hourly_rate,
      user:user_id(
        image_url
      ),
      bio
      `)

    if (error) console.log(error);
    return data;
  },
  getFullWorkerProfile: async (workerId) => {
    const { data, error } = await supabase
      .from('workers')
      .select(`
        *,
        services:worker_services(
          service_id,
          services(
            service_name
          )
        ),
        user:users(
          image_url
        )
      `)
      .eq('worker_id', workerId)
      .single();

    if (error) throw error;
    return data;
  },

  updateWorker: async (workerId, updates) => {
    const { data, error } = await supabase
      .from('workers')
      .update(updates)
      .eq('worker_id', workerId)
      .select();

    if (error) throw error;
    return data;
  },

  updateWorkerServices: async (workerId, serviceIds) => {
    // Delete existing services
    // await supabase
    //   .from('worker_services')
    //   .delete()
    //   .eq('worker_id', workerId);

    // Insert new services
    const servicesToInsert = serviceIds.map(service_id => ({
      worker_id: workerId,
      service_id
    }));

    console.log("services to insert", servicesToInsert); //debugging

    const { error } = await supabase
      .from('worker_services')
      .insert(servicesToInsert);

    if (error) throw error;
  }
};