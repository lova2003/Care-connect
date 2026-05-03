import { Router } from "express";
import Doctor from "../models/Doctor.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// GET /api/doctors — public, with optional query filters
router.get("/", async (req, res) => {
  try {
    const { specialty, available, minRating, q } = req.query;
    const filter = {};

    if (specialty) {
      filter.specialty = specialty;
    }

    if (available === "true") {
      filter.available = true;
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { specialty: regex }];
    }

    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/doctors/:id — public
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    console.error("Get doctor error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/doctors — admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, specialty, experience, rating, bio, qualifications, available, fee } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const doctor = await Doctor.create({
      name,
      specialty: specialty || "General Medicine",
      experience: Number(experience) || 0,
      rating: Math.min(5, Math.max(0, Number(rating) || 4.5)),
      bio: bio || "",
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      available: available !== false,
      fee: Number(fee) || 50,
    });

    res.status(201).json(doctor);
  } catch (error) {
    console.error("Add doctor error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// PUT /api/doctors/:id — admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const { name, specialty, experience, rating, bio, qualifications, available, fee } = req.body;

    if (name !== undefined) doctor.name = name;
    if (specialty !== undefined) doctor.specialty = specialty;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (rating !== undefined) doctor.rating = Math.min(5, Math.max(0, Number(rating)));
    if (bio !== undefined) doctor.bio = bio;
    if (qualifications !== undefined) doctor.qualifications = qualifications;
    if (available !== undefined) doctor.available = available;
    if (fee !== undefined) doctor.fee = Number(fee);

    await doctor.save();
    res.json(doctor);
  } catch (error) {
    console.error("Update doctor error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// DELETE /api/doctors/:id — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor removed" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
