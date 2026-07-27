const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBase64 = async (base64, name) => {
  const result = await cloudinary.uploader.upload(base64, {
    folder: 'thinkaiworks',
    public_id: `${Date.now()}-${name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}`,
    resource_type: 'auto',
  });
  return { url: result.secure_url, public_id: result.public_id, name };
};

const destroyFile = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadBase64, destroyFile };
