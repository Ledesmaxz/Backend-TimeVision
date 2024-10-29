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

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        resolve(publicUrl);
      });

      stream.on('error', (err) => {
        if (err.code === 403) {
          reject("Error de permisos: Verifica que el bucket tiene acceso público o que la cuenta de servicio tiene permisos de escritura.");
        } else if (err.code === 404) {
          reject("Bucket no encontrado: Verifica el nombre del bucket y que esté correctamente especificado en la variable de entorno.");
        } else {
          reject(`Error al subir la imagen a Google Cloud Storage: ${err.message}`);
        }
      });
    });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error("Error: No se encontró el archivo de credenciales. Verifica la ruta en GOOGLE_CLOUD_KEYFILE.");
    } else if (error.code === 401) {
      console.error("Error de autenticación: Verifica las credenciales en el archivo JSON.");
    } else {
      console.error("Error inesperado:", error.message);
    }
    throw error;
  }
}

module.exports = uploadFile;
