const cloudinary = require('cloudinary').v2;
const { PassThrough } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ponytail: only images and PDFs are allowed; both upload as 'image' type
// Cloudinary serves image-type resources inline, so PDFs open in browser by default
function uploadBuffer(buffer, name) {
  const publicId = `${Date.now()}-${name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}`;

  console.log(`[upload] starting name=${name} type=image buffer_length=${buffer.length}`);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'thinkaiworks',
      public_id: publicId,
      resource_type: 'image',
    }, (error, result) => {
      if (error) {
        console.error(`[upload] failed name=${name} error=${error.message}`);
        reject(error);
        return;
      }

      console.log(`[upload] done name=${name} cloudinary_bytes=${result.bytes} resource_type=${result.resource_type} format=${result.format} url=${result.secure_url}`);

      resolve({
        url: result.secure_url,
        public_id: result.public_id,
        name,
        resource_type: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        original_filename: result.original_filename,
      });
    });

    const passthrough = new PassThrough();
    passthrough.pipe(stream);
    passthrough.end(buffer);
  });
}

const destroyFile = async (publicId) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};

module.exports = { uploadBuffer, destroyFile };
