import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      enum: [
        "Cardiology",
        "Dermatology",
        "Neurology",
        "Pediatrics",
        "Orthopedics",
        "General Medicine",
      ],
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    qualifications: {
      type: [String],
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },
    fee: {
      type: Number,
      default: 50,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual id field for frontend compatibility
doctorSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Doctor", doctorSchema);
