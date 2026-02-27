const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

/**
 * @desc    Access or create a one-to-one chat
 * @route   POST /api/chats/access
 * @access  Private
 */
const accessChat = async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user._id;

  if (!userId) {
    return res.status(400).json({ message: "UserId is required" });
  }

  let participants;

  // Self chat
  if (userId.toString() === currentUserId.toString()) {
    participants = [currentUserId];
  } else {
    participants = [currentUserId, userId];
  }

  let chat = await Chat.findOneAndUpdate(
    {
      isGroupChat: false,
      participants: { $size: participants.length, $all: participants },
    },
    {
      $setOnInsert: {
        participants,
        isGroupChat: false,
      },
    },
    {
      new: true,
      upsert: true,
    }
  )
    .populate("participants", "-password")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name avatar" },
    });

  res.status(200).json({ success: true, chat });
};

/**
 * @desc    Get all chats for current user
 * @route   GET /api/chats
 * @access  Private
 */
const getMyChats = async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id,
  })
    .populate('participants', 'name email avatar status lastSeen')
    .populate('groupAdmin', 'name avatar')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name avatar' },
    })
    .sort({ updatedAt: -1 });

  res.json({ success: true, chats });
};

/**
 * @desc    Create a group chat
 * @route   POST /api/chats/group
 * @access  Private
 */
const createGroupChat = async (req, res) => {   
  const { groupName, participants } = req.body;

  if (!groupName || !participants || participants.length < 2) {
    return res.status(400).json({ message: 'Group name and at least 2 participants required' });
  }

  const allParticipants = [...new Set([...participants, req.user._id.toString()])];

  const chat = await Chat.create({
    isGroupChat: true, 
    groupName,
    participants: allParticipants,
    groupAdmin: req.user._id,
  });

  const fullChat = await Chat.findById(chat._id)
    .populate('participants', '-password')
    .populate('groupAdmin', 'name avatar');

  res.status(201).json({ success: true, chat: fullChat });
};

/**
 * @desc    Update group chat (name, avatar, add/remove members)
 * @route   PUT /api/chats/group/:chatId
 * @access  Private (Admin only)
 */
const updateGroupChat = async (req, res) => {
  const { chatId } = req.params;
  const { groupName, groupDescription, addMembers, removeMembers } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isGroupChat) {
    return res.status(404).json({ message: 'Group chat not found' });
  }

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only group admin can update group' });
  }

  if (groupName) chat.groupName = groupName;
  if (groupDescription !== undefined) chat.groupDescription = groupDescription;

  // Add members
  if (addMembers?.length) {
    chat.participants = [...new Set([...chat.participants.map(String), ...addMembers])];
  }

  // Remove members (can't remove admin)
  if (removeMembers?.length) {
    chat.participants = chat.participants.filter(
      (p) => !removeMembers.includes(p.toString()) || p.toString() === chat.groupAdmin.toString()
    );
  }

  // Update group avatar if uploaded
  if (req.file) {
    chat.groupAvatar = req.file.path;
  }

  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate('participants', '-password')
    .populate('groupAdmin', 'name avatar');

  res.json({ success: true, chat: updatedChat });
};

/**
 * @desc    Leave group chat
 * @route   DELETE /api/chats/group/:chatId/leave
 * @access  Private
 */
const leaveGroupChat = async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isGroupChat) {
    return res.status(404).json({ message: 'Group not found' });
  }

  chat.participants = chat.participants.filter(
    (p) => p.toString() !== req.user._id.toString()
  );

  // If admin leaves, transfer to next member
  if (chat.groupAdmin.toString() === req.user._id.toString() && chat.participants.length > 0) {
    chat.groupAdmin = chat.participants[0];
  }

  await chat.save();
  res.json({ success: true, message: 'Left group successfully' });
};

/**
 * @desc    Get chat by ID
 * @route   GET /api/chats/:chatId
 * @access  Private
 */
const getChatById = async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)
    .populate('participants', '-password')
    .populate('groupAdmin', 'name avatar')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name avatar' },
    });

  if (!chat) {
    return res.status(404).json({ message: 'Chat not found' });
  }

  // Check if user is a participant
  const isParticipant = chat.participants.some(
    (p) => p._id.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({ success: true, chat });
};

module.exports = { accessChat, getMyChats, createGroupChat, updateGroupChat, leaveGroupChat, getChatById };
