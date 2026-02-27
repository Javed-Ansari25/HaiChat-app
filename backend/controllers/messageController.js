const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { getIO, getOnlineUsers } = require('../socket/socketManager');

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  const { chatId, content, messageType = 'text', replyTo } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: 'chatId is required' });
  }

  // Validate chat exists and user is participant
  const chat = await Chat.findOne({
    _id: chatId,
    participants: req.user._id,
  });

  if (!chat) {
    return res.status(404).json({ message: 'Chat not found or access denied' });
  }

  // Build message object
  const msgData = {
    sender: req.user._id,
    chatId,
    content: content || '',
    messageType,
  };

  if (replyTo) msgData.replyTo = replyTo;

  // Handle media upload
  if (req.file) {
    msgData.mediaUrl = req.file.path;
    msgData.mediaPublicId = req.file.filename;
    msgData.fileName = req.file.originalname;
    msgData.fileSize = req.file.size;
  }

  let message = await Message.create(msgData);

  // Populate sender info
  // message = await Message.findById(message._id)
  //   .populate('sender', 'name avatar')
  //   .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name' } });

  await message.populate([
    { path: 'sender', select: 'name avatar' },
    { 
      path: 'replyTo',
      populate: { path: 'sender', select: 'name' }
    }
  ]);

  // Update chat's lastMessage
  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

  // Emit via Socket.IO
  const io = getIO();
  const onlineUsers = getOnlineUsers();

  // Mark as delivered to online participants
  const onlineParticipantIds = chat.participants
    .filter((p) => p.toString() !== req.user._id.toString() && onlineUsers.has(p.toString()))
    .map((p) => p.toString());

  if (onlineParticipantIds.length > 0) {
    await Message.findByIdAndUpdate(message._id, {
      $addToSet: { deliveredTo: { $each: onlineParticipantIds } },
    });
  }

  io.to(chatId).emit('new_message', { message, chatId });

  res.status(201).json({ success: true, message });
};

/**
 * @desc    Get messages for a chat (paginated)
 * @route   GET /api/messages/:chatId
 * @access  Private
 */
const getMessages = async (req, res) => { 
  try {
    const { chatId } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 30, 50); // max cap
    const skip = (page - 1) * limit;

    // Verify participant (only check existence, no full doc needed)
    const chatExists = await Chat.exists({
      _id: chatId,
      participants: req.user._id,
    });

    if (!chatExists) {
      return res.status(403).json({ message: "Access denied" });
    }

    const baseQuery = {
      chatId,
      deletedFor: { $ne: req.user._id },
      isDeleted: false,
    };

    // Run messages + count in parallel
    const [messages, total] = await Promise.all([
      Message.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name avatar")
        .populate({
          path: "replyTo",
          populate: { path: "sender", select: "name" },
        })
        .lean(), // returns plain JS objects

      Message.countDocuments(baseQuery),
    ]);

    // Mark unseen messages as seen (only latest batch)
    const unseenMessageIds = messages
      .filter(
        (msg) =>
          msg.sender._id.toString() !== req.user._id.toString() &&
          !msg.seenBy?.some(
            (s) => s.user.toString() === req.user._id.toString()
          )
      )
      .map((msg) => msg._id);

    if (unseenMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unseenMessageIds } },
        {
          $addToSet: {
            seenBy: {
              user: req.user._id,
              seenAt: new Date(),
            },
          },
        }
      );

      // notify room only if something changed
      const io = getIO();
      io.to(chatId).emit("messages_seen", {
        chatId,
        userId: req.user._id,
      });
    }

    return res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const { deleteForEveryone } = req.body;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  if (deleteForEveryone && message.sender.toString() === req.user._id.toString()) {
    // Delete for everyone
    message.isDeleted = true;
    message.content = 'This message was deleted';
    await message.save();

    const io = getIO();
    io.to(message.chatId.toString()).emit('message_deleted', {
      messageId,
      chatId: message.chatId,
      deleteForEveryone: true,
    });
  } else {
    // Delete only for this user
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: req.user._id },
    });
  }

  res.json({ success: true, message: 'Message deleted' });
};

/**
 * @desc    Mark messages as seen
 * @route   PUT /api/messages/:chatId/seen
 * @access  Private
 */
const markAsSeen = async (req, res) => {
  const { chatId } = req.params;
  if (!chatId) return res.status(400).json({ error: "ChatId required" });

  const result = await Message.updateMany(
    {
      chatId,
      sender: { $ne: req.user._id },
      'seenBy.user': { $ne: req.user._id },
    },
    {
      $addToSet: { seenBy: { user: req.user._id, seenAt: new Date() } },
    }
  );

  const io = getIO();
  if (result.modifiedCount > 0) {
    io.to(chatId).emit('messages_seen', { chatId, userId: req.user._id });
  }

  res.json({ success: true });
};

module.exports = { sendMessage, getMessages, deleteMessage, markAsSeen };
