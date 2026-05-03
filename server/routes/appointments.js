import { Router } from "express";
import Appointment from "../models/Appointment.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// GET /api/appointments — logged in user gets their own; admin gets all
router.get("/", protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role !== "admin") {
      // Patients only see their own
      filter.patientId = req.user._id;
    }

    // Optional query filters (for admin)
    const { status, doctorId } = req.query;
    if (status && status !== "all") {
      filter.status = status;
    }
    if (doctorId && doctorId !== "all") {
      filter.doctorId = doctorId;
    }

    const appointments = await Appointment.find(filter).sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/appointments — book an appointment
router.post("/", protect, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date, and time are required" });
    }

    // Check for existing appointment at same slot
    const conflict = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    if (conflict) {
      return res.status(409).json({ message: "This time slot is already booked" });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user._id,
      patientName: req.user.name,
      patientEmail: req.user.email,
      date,
      time,
      status: "confirmed",
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// PUT /api/appointments/:id — reschedule or cancel
router.put("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Patients can only modify their own
    if (
      req.user.role !== "admin" &&
      appointment.patientId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { date, time, status } = req.body;

    if (date !== undefined) appointment.date = date;
    if (time !== undefined) appointment.time = time;
    if (status !== undefined) appointment.status = status;

    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// GET /api/appointments/booked-times/:doctorId/:date — get booked times for a slot
router.get("/booked-times/:doctorId/:date", async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const appointments = await Appointment.find({
      doctorId,
      date,
      status: { $ne: "cancelled" },
    });
    const bookedTimes = appointments.map((a) => a.time);
    res.json(bookedTimes);
  } catch (error) {
    console.error("Get booked times error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
