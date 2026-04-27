import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log("CONNECTION TO DB DONE 👍");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export default connectDB;
