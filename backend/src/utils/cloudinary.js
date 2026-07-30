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
  // ponytail: fl_inline forces browser to display instead of download for raw files
  const url = result.secure_url.replace('/upload/', '/upload/fl_inline/');
  return {
    url,
    public_id: result.public_id,
    name,
    resource_type: result.resource_type,
    format: result.format,
    bytes: result.bytes,
    original_filename: result.original_filename,
  };
};

const destroyFile = async (publicId, resourceType = 'image') => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { uploadBase64, destroyFile };
