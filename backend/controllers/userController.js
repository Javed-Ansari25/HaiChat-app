const User = require('../models/User');

/**
 * @desc    Search users by name or email
 * @route   GET /api/users/search?q=
 * @access  Private
 */
const searchUsers = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 1) {
    return res.json({ success: true, users: [] });
  }

  const users = await User.find({
    $and: [
      { _id: { $ne: req.user._id } }, // Exclude current user
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      },
    ],
  }).select('name email avatar status lastSeen bio').limit(20);

  res.json({ success: true, users });
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ success: true, user });
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  const { name, bio, aiEnabled, autoReplyEnabled } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, bio, aiEnabled, autoReplyEnabled },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({ success: true, user: updatedUser });
};

/**
 * @desc    Update avatar
 * @route   PUT /api/users/avatar
 * @access  Private
 */
const updateAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.path },
    { new: true }
  ).select('-password');

  res.json({ success: true, user, avatarUrl: req.file.path });
};

module.exports = { searchUsers, getUserById, updateProfile, updateAvatar };
