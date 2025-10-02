const ImageKit = require('imagekit');
const {v4 : uuidv4} = require('uuid')

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadImage({ buffer, folder = '/products' }) {
  const response = await imagekit.upload({
    file: buffer,
    fileName: uuidv4(),
    folder
  });
  return {
    url: response.url,
    thumbnail: response.thumbnailUrl || response.url,
    fileId: response.fileId,
  }
}

module.exports = {imagekit, uploadImage};