const User = require('../models/User');
const { generateTokenAndSetCookie } = require('../utils/jwt');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
*/
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });

  generateTokenAndSetCookie(res, user._id);

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      status: user.status,
      aiEnabled: user.aiEnabled,
    },
  });
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Update status to online
  user.status = 'online';
  await user.save({ validateBeforeSave: false });

  generateTokenAndSetCookie(res, user._id);

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      status: user.status,
      aiEnabled: user.aiEnabled,
      autoReplyEnabled: user.autoReplyEnabled,
    },
  });
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  // Update status to offline
  await User.findByIdAndUpdate(req.user._id, {
    status: 'offline',
    lastSeen: new Date(),
  });

  res.cookie('jwt', '', { maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

module.exports = { register, login, logout, getMe };
