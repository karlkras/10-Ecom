import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import validator from "validator";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, "email is required"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email"
    },
    unique: true
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minlength: 6
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  }
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

export default mongoose.model("User", userSchema);
