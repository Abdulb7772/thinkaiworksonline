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

  console.log(`[upload] file=${name} detected_type=${result.resource_type} format=${result.format} url=${result.secure_url} public_id=${result.public_id}`);

  // ponytail: image/video serve inline by default; raw serves as attachment
  // only add fl_inline for raw PDFs so they open in browser instead of downloading
  let url = result.secure_url;
  if (result.resource_type === 'raw' && result.format === 'pdf') {
    url = result.secure_url.replace('/upload/', '/upload/fl_inline/');
  }

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
