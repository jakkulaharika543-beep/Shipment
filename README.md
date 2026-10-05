# 🚚 ShipTrack

Beginner-friendly Delivery & Shipment Management hackathon MVP.

## Features

- Customer registration/login
- JWT authentication
- Shipment creation
- Unique tracking ID
- Public shipment tracking
- Tracking timeline
- Customer dashboard
- Delivery-person dashboard
- Delivery status updates
- Admin dashboard
- Admin assignment of delivery personnel
- Estimated delivery date
- Responsive UI

## Tech stack

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcryptjs

## 1. Install

Install Node.js and MongoDB, then open a terminal in this folder:

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env`.

For local MongoDB:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shiptrack
JWT_SECRET=put_a_long_random_secret_here
```

## 3. Create demo admin and delivery accounts

```bash
npm run seed
```

Demo accounts:

Admin:
- email: admin@shiptrack.com
- password: Admin@123

Delivery:
- email: delivery@shiptrack.com
- password: Delivery@123

For a real deployment, change these credentials and do not publish them in your presentation.

## 4. Run

```bash
npm start
```

Open:

http://localhost:5000

## How the demo works

### Customer

1. Register.
2. Login.
3. Create a shipment.
4. Copy the generated tracking ID.
5. Open Track Shipment.
6. Enter the tracking ID.

### Admin

1. Login using the demo admin account.
2. See all shipments.
3. Assign a delivery person.

### Delivery person

1. Login using the demo delivery account.
2. See assigned shipments.
3. Change status from CREATED to PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY and DELIVERED.
4. Open the public tracking page to demonstrate the updated timeline.

## Deployment

This project serves the frontend from the same Express server, so it can be deployed as one Node service.

Use a hosted MongoDB such as MongoDB Atlas and set:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_secret
PORT=5000
```

Set the service start command to:

```bash
npm start
```

## Next hackathon upgrades

- Real maps and route distance
- OTP verification
- Email/SMS notifications
- QR code for tracking ID
- Proof-of-delivery photo/signature
- AI ETA and delay prediction
- Analytics dashboard
- Password reset
- Rate limiting and stronger production security
