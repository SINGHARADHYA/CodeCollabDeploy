require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcrypt');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Check if email already exists
    const email = `test_${Date.now()}@test.com`;
    console.log('Creating user with email:', email);
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({ name: 'Test User', email, password: hashedPassword });
    console.log('User created:', user._id);
    
  } catch (error) {
    console.error('ERROR OCCURRED:', error);
  } finally {
    process.exit(0);
  }
}

test();
