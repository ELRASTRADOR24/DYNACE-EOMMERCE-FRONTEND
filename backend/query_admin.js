import mongoose from 'mongoose';
const URI = "mongodb+srv://admin:4aOH4utY2gJM6q4H@cluster0.tmgtwyi.mongodb.net/dynaceGlobal";
const UserSchema = new mongoose.Schema({ email: String, is_admin: Boolean });
const User = mongoose.model('User', UserSchema);

async function run() {
  await mongoose.connect(URI);
  const admins = await User.find({ is_admin: true });
  console.log("Admins:", admins.map(a => a.email));
  const users = await User.find();
  console.log("All users:", users.map(u => ({ email: u.email, is_admin: u.is_admin })));
  process.exit();
}
run();
