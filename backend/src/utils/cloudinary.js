const cloudinary = require('cloudinary').v2;
const { PassThrough } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBuffer(buffer, name, mime) {
  const isPdf = mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
  const resourceType = isPdf ? 'raw' : 'image';
  const publicId = `${Date.now()}-${name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}`;

  console.log(`[upload] start name=${name} mime=${mime} type=${resourceType} buffer=${buffer.length}`);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'thinkaiworks',
      public_id: publicId,
      resource_type: resourceType,
    }, (error, result) => {
      if (error) {
        console.error(`[upload] fail name=${name} error=${error.message}`);
        reject(error);
        return;
      }

      console.log(`[upload] done name=${name} bytes=${result.bytes} format=${result.format} type=${result.resource_type} url=${result.secure_url}`);

      if (result.bytes !== buffer.length) {
        console.error(`[upload] SIZE MISMATCH name=${name} original=${buffer.length} cloudinary=${result.bytes}`);
      }

      // ponytail: raw files serve as attachment by default; fl_inline forces inline display
      let url = result.secure_url;
      if (result.resource_type === 'raw') {
        url = result.secure_url.replace('/upload/', '/upload/fl_inline/');
      }

      resolve({
        url,
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

const destroyFile = async (publicId, resourceType = 'image') => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { uploadBuffer, destroyFile };
