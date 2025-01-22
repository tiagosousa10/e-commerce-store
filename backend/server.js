import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"

import { connectDB } from "./lib/db.js";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); //allows you to parse req.body
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);

app.listen(PORT, () => {
	console.log("Server backend is running on http://localhost:" + PORT);
  connectDB();
});
