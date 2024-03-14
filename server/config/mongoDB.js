import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    // const conn = await mongoose.connect(process.env.MONGO_URL, {
    //   useUnifiedTopology: true,
    //   useNewUrlParser: true,
    // });
    const conn = await mongoose.connect(process.env.MONGO_URL);

    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;