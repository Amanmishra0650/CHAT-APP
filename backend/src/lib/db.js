import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    
    // Use local MongoDB for development if MONGODB_URI is not set
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp";
    console.log("MongoDB URI:", mongoURI);
    
    // Add connection options with timeout and retry settings
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      family: 4 // Use IPv4, skip trying IPv6
    };
    
    const conn = await mongoose.connect(mongoURI, options);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.log("For local development, you can install MongoDB locally or use MongoDB Atlas with your IP whitelisted");
    // Don't exit the process so the server stays running
    return false;
  }
};
