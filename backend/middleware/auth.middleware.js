import { supabase } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'multimedia_learning_secret_key_2024';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Fetch user profile data from users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, avatar')
      .eq('id', data.user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = userProfile;
    req.user.auth_id = data.user.id;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

const generateToken = async (userId, email) => {
  // Use Supabase session token instead of generating JWT
  // In a real app, return the session token from Supabase auth
  try {
    const { data, error } = await supabase.auth.admin.createSession({
      user_id: userId
    });
    
    if (error) throw error;
    return data.session.access_token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

export { authenticateToken, authorizeRoles, generateToken };
