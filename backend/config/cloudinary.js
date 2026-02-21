const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for media messages
const messageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hai-chat/messages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
  },
});

// Storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hai-chat/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }],
  },
});

const uploadMessage = multer({ storage: messageStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = { cloudinary, uploadMessage, uploadAvatar };
