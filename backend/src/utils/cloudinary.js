const cloudinary = require('cloudinary').v2;
const { PassThrough } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_EXTS = ['jpg','jpeg','png','gif','webp','svg','bmp','ico','tiff'];
const VIDEO_EXTS = ['mp4','webm','mov','avi','mkv','wmv','flv'];

function detectResourceType(name) {
  const ext = (name || '').split('.').pop()?.toLowerCase();
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  return 'raw';
}

function uploadBuffer(buffer, name) {
  const publicId = `${Date.now()}-${name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}`;
  const resourceType = detectResourceType(name);

  console.log(`[upload] starting name=${name} type=${resourceType} buffer_length=${buffer.length}`);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'thinkaiworks',
      public_id: publicId,
      resource_type: resourceType,
    }, (error, result) => {
      if (error) {
        console.error(`[upload] failed name=${name} error=${error.message}`);
        reject(error);
        return;
      }

      console.log(`[upload] done name=${name} cloudinary_bytes=${result.bytes} resource_type=${result.resource_type} format=${result.format} url=${result.secure_url}`);

      if (result.bytes !== buffer.length) {
        console.warn(`[upload] SIZE MISMATCH name=${name} original=${buffer.length} cloudinary=${result.bytes}`);
      }

      let url = result.secure_url;
      if (result.resource_type === 'raw' && result.format === 'pdf') {
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

// ponytail: keep for backward compat with any code passing base64 directly
const uploadBase64 = async (base64, name) => {
  const raw = base64.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(raw, 'base64');
  return uploadBuffer(buffer, name);
};

const destroyFile = async (publicId, resourceType = 'image') => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { uploadBase64, uploadBuffer, destroyFile };
