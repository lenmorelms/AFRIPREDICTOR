import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    age: {
        type: Number,
        required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    country: {
        type: String,
        required: false,
    },
    tournaments: {
        type: Array,
        required: true,
        default: [],
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String
    },
  },
  {
    timestamps: true,
  }
);

// Login
userSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

// Register
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;