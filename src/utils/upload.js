const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
});

async function uploadFile(bucketName, fileBuffer, fileOutputName, mimetype) {
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileOutputName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: mimetype, 
      },
      resumable: false, 
    });

    
    stream.end(fileBuffer);

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        resolve(publicUrl); 
      });

      stream.on('error', (err) => {
        reject(`Error al subir la imagen: ${err.message}`);
      });
    });
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    throw error;
  }
}


module.exports = uploadFile;
