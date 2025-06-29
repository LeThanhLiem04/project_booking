import { userService } from '../services/user-service.js';

/**
 * @description Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body); // Debug log
    const { user, token } = await userService.register(req.body);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error); // Debug log
    if (error.message.includes('required')) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        error: error.message 
      });
    }
    if (error.message.includes('already registered')) {
      return res.status(409).json({ 
        message: 'Email already registered',
        error: error.message 
      });
    }
    res.status(400).json({ 
      message: 'Registration failed',
      error: error.message 
    });
  }
};

/**
 * @description Login a user
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body); // Debug log
    const { user, token } = await userService.login(req.body);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('Login error:', error); // Debug log
    res.status(401).json({ 
      message: 'Login failed',
      error: error.message 
    });
  }
};

/**
 * @description Get current user profile
 * @route GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error); // Debug log
    res.status(500).json({ 
      message: 'Failed to get user profile',
      error: error.message 
    });
  }
};