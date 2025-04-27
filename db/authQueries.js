const supabase = require('../db/pool');

exports.createUser = async (email, password) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: password }])
    .select()
    .single();

  if (error) throw new Error('User creation failed');
  return data;
};

exports.assignRoles = async (userId, roles) => {
  const roleEntries = roles.map(role => ({ 
    user_id: userId, 
    role_id: role === 'client' ? 1 : 2 
  }));

  const { error } = await supabase
    .from('user_roles')
    .insert(roleEntries);

  if (error) throw new Error('Role assignment failed');
};

exports.createClientProfile = async (userId, clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([{ 
      user_id: userId,
      full_name: clientData.full_name,
      phone: clientData.phone,
      location: clientData.location
    }])
    .single();

  if (error) throw new Error('Client profile creation failed');
  return data;
};

exports.createWorkerProfile = async (userId, workerData) => {
  const { data, error } = await supabase
    .from('workers')
    .insert([{
      user_id: userId,
      full_name: workerData.full_name,
      phone: workerData.phone,
      location: workerData.location,
      hourly_rate: workerData.hourly_rate,
      experience_years: workerData.experience
    }])
    .single();

  if (error) throw new Error('Worker profile creation failed');
  return data;
};

exports.addWorkerServices = async (workerId, services) => {
  const serviceEntries = services.map(service => ({
    worker_id: workerId,
    service_id: service.id,
    price: service.price,
    min_experience: service.experience
  }));

  const { error } = await supabase
    .from('worker_services')
    .insert(serviceEntries);

  if (error) throw new Error('Service assignment failed');
};