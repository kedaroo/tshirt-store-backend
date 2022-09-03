require("dotenv").config();
const app = require("./app");
const connectWithDb = require("./config/db");
const cloudinary = require("cloudinary");

const { PORT } = process.env;

// connect with database
connectWithDb();

// cloudinary config
const cloud_name = process.env.CLOUDINARY_API_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;
cloudinary.config({ cloud_name, api_key, api_secret });

app.listen(PORT, () => console.log(`server is running on ${PORT}...`));
