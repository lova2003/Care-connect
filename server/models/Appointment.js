import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    date: {
      type: String, // ISO yyyy-mm-dd
      required: true,
    },
    time: {
      type: String, // "09:30"
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual id field
appointmentSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.doctorId = ret.doctorId?.toString ? ret.doctorId.toString() : ret.doctorId;
    ret.patientId = ret.patientId?.toString ? ret.patientId.toString() : ret.patientId;
    ret.createdAt = ret.createdAt?.toISOString?.() ?? ret.createdAt;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Appointment", appointmentSchema);
