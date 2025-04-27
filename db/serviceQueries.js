const supabase = require('../db/pool');

exports.getAllServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*');

  if (error) throw new Error('Failed to fetch services');
  return data;
};

exports.getWorkerServices = async (workerId) => {
  const { data, error } = await supabase
    .from('worker_services')
    .select(`
      service_id,
      services (service_name),
      price,
      min_experience
    `)
    .eq('worker_id', workerId);

  if (error) throw new Error('Failed to fetch worker services');
  return data;
};