import mongoose from 'mongoose';
import { connectDatabase, Order, User } from '../backend/database.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env' });

async function checkOrders() {
  await connectDatabase();
  const orders = await Order.find();
  console.log("Total orders:", orders.length);
  for (let o of orders) {
    console.log(`Order: ${o.order_number}, email: ${o.email}, user_id: ${o.user_id}, status: ${o.status}`);
  }
  const users = await User.find();
  console.log("Total users:", users.length);
  for (let u of users) {
    console.log(`User: ${u.email}, id: ${u._id}`);
  }
  mongoose.disconnect();
}
checkOrders().catch(console.error);
