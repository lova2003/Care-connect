import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Doctor from "./models/Doctor.js";
import Appointment from "./models/Appointment.js";

async function seed() {
  await connectDB();

  console.log("🌱 Seeding database...");

  // Clear existing data
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Appointment.deleteMany({});

  // Create admin user
  const admin = await User.create({
    name: "Admin User",
    email: "admin@demo.com",
    password: "password",
    role: "admin",
  });
  console.log(`  ✅ Admin created: admin@demo.com / password`);

  // Create demo patient
  const patient = await User.create({
    name: "Demo Patient",
    email: "patient@demo.com",
    password: "password",
    role: "patient",
  });
  console.log(`  ✅ Patient created: patient@demo.com / password`);

  // Create doctors
  const doctorsData = [
    {
      name: "Dr. Amara Okafor",
      specialty: "Cardiology",
      experience: 14,
      rating: 4.9,
      bio: "Interventional cardiologist focused on preventive heart care and minimally invasive procedures.",
      qualifications: ["MBBS, AIIMS", "MD Cardiology", "Fellow, ACC"],
      available: true,
      fee: 80,
    },
    {
      name: "Dr. Liam Bennett",
      specialty: "Dermatology",
      experience: 9,
      rating: 4.7,
      bio: "Specialist in medical and cosmetic dermatology with a calm, patient-first approach.",
      qualifications: ["MBBS", "MD Dermatology"],
      available: true,
      fee: 60,
    },
    {
      name: "Dr. Sana Iqbal",
      specialty: "Neurology",
      experience: 11,
      rating: 4.8,
      bio: "Neurologist treating migraines, epilepsy, and movement disorders with evidence-based care.",
      qualifications: ["MBBS", "DM Neurology"],
      available: false,
      fee: 95,
    },
    {
      name: "Dr. Mateo Rivera",
      specialty: "Pediatrics",
      experience: 7,
      rating: 4.9,
      bio: "Gentle pediatric care from newborns to teens. Believes in listening before prescribing.",
      qualifications: ["MBBS", "MD Pediatrics"],
      available: true,
      fee: 55,
    },
    {
      name: "Dr. Hannah Choi",
      specialty: "Orthopedics",
      experience: 16,
      rating: 4.6,
      bio: "Orthopedic surgeon specializing in sports injuries and joint preservation.",
      qualifications: ["MBBS", "MS Orthopedics"],
      available: true,
      fee: 90,
    },
    {
      name: "Dr. Noah Adeyemi",
      specialty: "General Medicine",
      experience: 6,
      rating: 4.5,
      bio: "Family physician for everyday health, screenings, and chronic care management.",
      qualifications: ["MBBS", "MD Internal Medicine"],
      available: true,
      fee: 45,
    },
  ];

  const doctors = await Doctor.insertMany(doctorsData);
  console.log(`  ✅ ${doctors.length} doctors created`);

  // Create demo appointments
  const twoDaysFromNow = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  await Appointment.insertMany([
    {
      doctorId: doctors[0]._id,
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      date: twoDaysFromNow,
      time: "10:00",
      status: "confirmed",
    },
    {
      doctorId: doctors[3]._id,
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      date: sevenDaysAgo,
      time: "15:30",
      status: "confirmed",
    },
  ]);
  console.log(`  ✅ 2 demo appointments created`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("   Login credentials:");
  console.log("   Patient: patient@demo.com / password");
  console.log("   Admin:   admin@demo.com / password\n");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
