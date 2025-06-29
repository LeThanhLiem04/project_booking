import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB } from './src/config/db.js';
import { userRepository } from './src/repositories/user-repository.js';

const createAdmin = async () => {
  await connectDB();
  const hashedPassword = await bcrypt.hash('admin', 10);
  const admin = {
    email: 'admin@gmail.com',
    password: hashedPassword,
    name: 'Admin User',
    role: 'admin'
  };
  await userRepository.create(admin);
  console.log('Admin created');
  process.exit(0);
};

createAdmin();