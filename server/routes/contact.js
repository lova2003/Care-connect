import { Router } from "express";
import Contact from "../models/Contact.js";

const router = Router();

// POST /api/contact — submit contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ message: "Message sent successfully", id: contact._id });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
