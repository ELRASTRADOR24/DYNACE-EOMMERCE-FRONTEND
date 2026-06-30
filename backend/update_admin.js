import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const URI = "mongodb+srv://admin:4aOH4utY2gJM6q4H@cluster0.tmgtwyi.mongodb.net/dynaceGlobal";
const UserSchema = new mongoose.Schema({ email: String, password: String, is_admin: Boolean });
const User = mongoose.model('User', UserSchema);

async function run() {
  await mongoose.connect(URI);
  const hash = await bcrypt.hash('admin1234', 10);
  await User.updateOne({ email: 'admin@dynace.com' }, { $set: { password: hash } });
  console.log("Password reset to admin1234");
  process.exit();
}
run();
