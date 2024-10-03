const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

const uploadFile = (file, ruta) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject('No se proporcionó ningún archivo.');
    }

    const ext = path.extname(file.originalname);

    const newFileName = `${ruta}${ext}`;

    const blob = bucket.file(newFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on('error', (err) => {
      reject('Error al subir la imagen a Google Cloud Storage: ' + err.message);
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl); 
    });

    blobStream.end(file.buffer);
  });
};

module.exports = uploadFile;
