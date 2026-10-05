const express = require("express");
const Shipment = require("../models/Shipment");
const User = require("../models/User");
const { auth, allowRoles } = require("../middleware/auth");

const router = express.Router();

const STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

function generateTrackingId() {
  return "ST" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// Customer creates a shipment
router.post("/", auth, allowRoles("customer"), async (req, res) => {
  try {
    const {
      senderName,
      senderPhone,
      pickupAddress,
      receiverName,
      receiverPhone,
      deliveryAddress,
      packageType,
      weight
    } = req.body;

    if (
      !senderName || !senderPhone || !pickupAddress ||
      !receiverName || !receiverPhone || !deliveryAddress ||
      !packageType || !weight
    ) {
      return res.status(400).json({ message: "Please fill all shipment fields" });
    }

    let trackingId;
    do {
      trackingId = generateTrackingId();
    } while (await Shipment.exists({ trackingId }));

    const shipment = await Shipment.create({
      trackingId,
      customer: req.user.id,
      senderName,
      senderPhone,
      pickupAddress,
      receiverName,
      receiverPhone,
      deliveryAddress,
      packageType,
      weight: Number(weight),
      status: "CREATED",
      estimatedDelivery: addDays(2),
      history: [
        {
          status: "CREATED",
          note: "Shipment created by customer",
          updatedAt: new Date()
        }
      ]
    });

    res.status(201).json({
      message: "Shipment created",
      shipment
    });
  } catch (error) {
    res.status(500).json({ message: "Could not create shipment", error: error.message });
  }
});

// Public tracking by tracking ID
router.get("/track/:trackingId", async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      trackingId: req.params.trackingId.toUpperCase()
    })
      .populate("deliveryPerson", "name phone")
      .populate("customer", "name email phone");

    if (!shipment) {
      return res.status(404).json({ message: "Tracking ID not found" });
    }

    res.json({ shipment });
  } catch (error) {
    res.status(500).json({ message: "Tracking failed", error: error.message });
  }
});

// Customer's shipments; delivery person's assignments; admin sees all
router.get("/", auth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "customer") {
      filter.customer = req.user.id;
    }

    if (req.user.role === "delivery") {
      filter.deliveryPerson = req.user.id;
    }

    const shipments = await Shipment.find(filter)
      .populate("customer", "name email phone")
      .populate("deliveryPerson", "name phone email")
      .sort({ createdAt: -1 });

    res.json({ shipments });
  } catch (error) {
    res.status(500).json({ message: "Could not load shipments", error: error.message });
  }
});

// Delivery/admin update shipment status
router.patch("/:id/status", auth, allowRoles("delivery", "admin"), async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    if (
      req.user.role === "delivery" &&
      String(shipment.deliveryPerson) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "This shipment is not assigned to you" });
    }

    shipment.status = status;
    shipment.history.push({
      status,
      note: note || `Status changed to ${status}`,
      updatedAt: new Date()
    });

    await shipment.save();

    res.json({ message: "Status updated", shipment });
  } catch (error) {
    res.status(500).json({ message: "Could not update status", error: error.message });
  }
});

// Admin gets delivery staff
router.get("/staff/delivery", auth, allowRoles("admin"), async (req, res) => {
  const staff = await User.find({ role: "delivery" }).select("name email phone");
  res.json({ staff });
});

// Admin assigns a shipment
router.patch("/:id/assign", auth, allowRoles("admin"), async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;

    const person = await User.findOne({
      _id: deliveryPersonId,
      role: "delivery"
    });

    if (!person) {
      return res.status(404).json({ message: "Delivery person not found" });
    }

    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { deliveryPerson: person._id },
      { new: true }
    )
      .populate("deliveryPerson", "name email phone");

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.json({ message: "Shipment assigned", shipment });
  } catch (error) {
    res.status(500).json({ message: "Could not assign shipment", error: error.message });
  }
});

module.exports = router;
