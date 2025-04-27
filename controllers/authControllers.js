import supabase from '../db/pool.js';
import bcrypt from 'bcryptjs';

// Validation functions
const validateRegistration = (body) => {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Common validations
  if (!body.email) errors.push({ msg: 'Barua pepe inahitajika' });
  if (!emailRegex.test(body.email)) errors.push({ msg: 'Barua pepe si sahihi' });
  if (!body.password) errors.push({ msg: 'Nenosiri linahitajika' });
  if (body.password && body.password.length < 6) errors.push({ msg: 'Nenosiri lazima liwe na herufi 6 au zaidi' });

  // Role-specific validations
  const roles = [];
  body.clientName ? roles.push('client') : roles.push('worker');

  if (roles.length === 0) {
    errors.push({ msg: 'Chagua angalau moja ya aina ya akaunti' });
  } else {
    if (roles.includes('client')) {
      if (!body.clientName) errors.push({ msg: 'Jina kamili la mteja linahitajika' });
    }
    
    if (roles.includes('worker')) {
      if (!body.workerName) errors.push({ msg: 'Jina kamili la mfanyakazi linahitajika' });
      if (!body.service || body.service.length === 0) {
        errors.push({ msg: 'Chagua angalau huduma moja' });
      }
    }
  }

  return { error: errors.length ? { details: errors } : null };
};

const validateLogin = (body) => {
  const errors = [];
  if (!body.email) errors.push({ msg: 'Barua pepe inahitajika' });
  if (!body.password) errors.push({ msg: 'Nenosiri linahitajika' });
  return { error: errors.length ? { details: errors } : null };
};

export const authController = {
  showLoginForm: (req, res) => {
    res.render('main', { 
      modal: 'login',
      csrfToken: req.csrfToken(),
      error: req.flash('error')[0]
    });
  },

  showRegisterForm: async (req, res) => {
    const { data: services, error } = await supabase
      .from('services')
      .select('*');

    res.render('main', {
      modal: 'register',
      services: services || [],
      csrfToken: req.csrfToken(),
      errors: req.flash('errors')
    });
  },

  loginUser: async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) {
      req.flash('error', error.details[0].msg);
      return res.redirect('/#login');
    }

    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', req.body.email)
        .single();

      if (userError || !user) {
        req.flash('error', 'Barua pepe au nenosiri si sahihi');
        return res.redirect('/#login');
      }

      // Verify password
      const validPassword = await bcrypt.compare(req.body.password, user.password_hash);
      if (!validPassword) {
        req.flash('error', 'Barua pepe au nenosiri si sahihi');
        return res.redirect('/#login');
      }

      // Get full user data
      const { data: fullUser, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          clients:clients(*),
          workers:workers(*, services:worker_services(*))
        `)
        .eq('user_id', user.user_id)
        .single();

      req.session.user = fullUser;
      res.redirect('/');
    } catch (err) {
      req.flash('error', 'Hitilafu katika mfumo, tafadhali jaribu tena baadaye');
      res.redirect('/#login');
    }
  },

  registerUser: async (req, res) => {
    const { error } = validateRegistration(req.body);
    if (error) {
      req.flash('errors', error.details);
      console.error('Validation error:', error.details);
      return res.redirect('/#register');
    }

    try {
      // Check if email exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', req.body.email)
        .single();

      if (existingUser) {
        req.flash('errors', [{ msg: 'Barua pepe tayari imetumika' }]);
        return res.redirect('/#register');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(req.body.password, salt);

      // Create user transaction
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([{
          email: req.body.email,
          password_hash: passwordHash,
          role: req.body.clientName ? 'client' : 'worker',
        }])
        .select('*')
        .single();
      
      //debugging
      console.log('User created:', user);

      if (userError) throw userError;

      // Assign roles
      const rolesToInsert = [];
      if (req.body.service === '') {
        rolesToInsert.push({ user_id: user.user_id, role_id: 1 });
        await supabase
          .from('clients')
          .insert([{
            user_id: user.user_id,
            full_name: req.body.clientName,
          }]);
      }

      if (req.body.service && req.body.service.length > 0) {
        rolesToInsert.push({ user_id: user.user_id, role_id: 2 });
        const { data: worker, error: workerError } = await supabase
          .from('workers')
          .insert([{
            user_id: user.user_id,
            full_name: req.body.workerName,
          }])
          .single();

        if (workerError) throw workerError;

        // // Insert worker services
        // const servicesToInsert = req.body.workerData.services.map(service => ({
        //   worker_id: worker.worker_id,
        //   service_id: service.id,
        //   price: service.price,
        //   min_experience: service.experience
        // }));

        // await supabase
        //   .from('worker_services')
        //   .insert(servicesToInsert);
      }

      // Insert roles
      if (rolesToInsert.length > 0) {
        await supabase
          .from('user_roles')
          .insert(rolesToInsert);
      }

      req.session.user = user;
      res.redirect('/');
    } catch (err) {
      console.error('Registration error:', err);
      req.flash('errors', [{ msg: 'Hitilafu katika usajili, tafadhali jaribu tena' }]);
      res.redirect('/#register');
      console.error('Registration error:', err);
    }
  },

  logoutUser: (req, res) => {
    req.session.destroy(err => {
      if (err) console.error('Logout error:', err);
      res.redirect('/');
    });
  }
};