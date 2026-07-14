const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { minioClient, bucketName } = require('../storage/minioClient');

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { mimetype, buffer, originalname, size } = req.file;

    if (size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10MB' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only jpeg, png, mp4 allowed.' });
    }

    const fileExt = originalname.split('.').pop();
    const objectName = `${uuidv4()}.${fileExt}`;
    let uploadBuffer = buffer;
    let finalMimetype = mimetype;

    if (mimetype.startsWith('image/')) {
      uploadBuffer = await sharp(buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .toBuffer();
    }

    await minioClient.putObject(bucketName, objectName, uploadBuffer, uploadBuffer.length, {
      'Content-Type': finalMimetype
    });

    const externalEndpoint = process.env.EXTERNAL_MINIO_ENDPOINT || 'localhost';
    const externalPort = process.env.EXTERNAL_MINIO_PORT || 9000;
    const url = `http://${externalEndpoint}:${externalPort}/${bucketName}/${objectName}`;

    res.status(201).json({ url, objectName });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Internal server error during upload' });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    await minioClient.removeObject(bucketName, id);
    res.json({ message: 'Media deleted successfully' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ error: 'Internal server error during delete' });
  }
};

module.exports = { uploadMedia, deleteMedia };
