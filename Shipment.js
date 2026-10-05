const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]
    },
    note: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    senderName: { type: String, required: true },
    senderPhone: { type: String, required: true },
    pickupAddress: { type: String, required: true },

    receiverName: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },

    packageType: { type: String, required: true },
    weight: { type: Number, required: true, min: 0.1 },

    status: {
      type: String,
      enum: ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"],
      default: "CREATED"
    },

    estimatedDelivery: { type: Date, default: null },
    history: { type: [historySchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
