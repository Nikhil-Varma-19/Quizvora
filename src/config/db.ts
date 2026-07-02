import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (retries = 5) => {
	console.log(`MongoDB URI: ${MONGO_URI}`);
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB connected successfully");
      return;
    } catch (error) {
      console.log(`❌ MongoDB connection failed (attempt ${i}/${retries})`);
			const errorMessage = (error as Error).message;
			console.error(`Error: ${errorMessage}`);

      if (i === retries) {
        console.error("❌ All retry attempts failed. Exiting...");
        process.exit(1);
      }

      await sleep(2000);
    }
  }
};

export default connectWithRetry;