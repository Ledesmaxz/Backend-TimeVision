const { Storage } = require('@google-cloud/storage');
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

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    return publicUrl;
  } catch (error) {
    console.error("Error al subir el archivo:", error.message);
    throw error;
  }
}

async function deleteFile(bucketName, fileName) {
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    await file.delete();
    console.log(`Archivo ${fileName} eliminado del bucket ${bucketName}.`);
  } catch (error) {
    console.error("Error al eliminar el archivo:", error.message);
    throw error;
  }
}

module.exports = { uploadFile, deleteFile };
