const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/user.model');

dotenv.config();

connectDB()

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const admin = new User({
      email: 'admin@gmail.com',
      password: 'admin123',
      username: 'admin',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedAdmin();