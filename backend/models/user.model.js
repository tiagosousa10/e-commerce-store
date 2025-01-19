import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  cartItems:[
    {
      quantity: {
        type: Number,
        default: 1
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    }
  ],
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  }
} , {timestamps: true}); // Add createdAt and updatedAt fields


const User = mongoose.model("User", userSchema);

//pre-save hook to hash the password before saving to the database
userSchema.pre("save", async function (next) { 
  if(!this.isModified("password")) return next(); // If password is not modified, skip

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next()
  } catch(error) {
    next(error)
  }
})

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password) // Compare the provided password with the hashed password
}

export default User;
