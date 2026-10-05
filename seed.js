const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const demoUsers = [
    {
      name: "ShipTrack Admin",
      email: "admin@shiptrack.com",
      phone: "9000000001",
      password: "Admin@123",
      role: "admin"
    },
    {
      name: "Demo Delivery",
      email: "delivery@shiptrack.com",
      phone: "9000000002",
      password: "Delivery@123",
      role: "delivery"
    }
  ];

  for (const item of demoUsers) {
    const existing = await User.findOne({ email: item.email });

    if (!existing) {
      await User.create({
        ...item,
        password: await bcrypt.hash(item.password, 10)
      });
      console.log(`Created ${item.role}: ${item.email}`);
    } else {
      console.log(`Already exists: ${item.email}`);
    }
  }

  await mongoose.disconnect();
  console.log("Seed complete");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
