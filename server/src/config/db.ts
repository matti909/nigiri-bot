import { connect } from "mongoose";

const uri = "mongodb://admin:password@localhost:27017/admin";

const connectDB = async () => {
  try {
    await connect(uri);
    console.log("MongoDB Ready");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;
