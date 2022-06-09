import mongoose from "mongoose";
import bcrypt from "bcrypt";

interface IUser {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    requried: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
  } else {
    next();
  }
});

export default mongoose.model("User", UserSchema);
