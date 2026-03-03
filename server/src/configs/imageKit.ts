import ImageKit from "imagekit";
import "dotenv/config";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.URL_ENDPOINT; // Make sure this matches your .env file key

if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("Missing ImageKit environment variables in .env file");
}

const imagekit = new ImageKit({
    publicKey: publicKey,
    privateKey: privateKey,
    urlEndpoint: urlEndpoint
});

export default imagekit;