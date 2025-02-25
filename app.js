import dotenv from "dotenv";
import "express-async-errors";
import connectDb from "./db/connect.js";
import { StatusCodes } from "http-status-codes";
import authRoutes from "./routes/authRouter.js";
import userRoutes from "./routes/userRouter.js";
import { xss } from "express-xss-sanitizer";
import productRoutes from "./routes/productRouter.js";
import reviewRoutes from "./routes/reviewRouter.js";
import orderRoutes from "./routes/orderRouter.js";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import expressMongoSanitize from "express-mongo-sanitize";

dotenv.config();

import express from "express";
const app = express();

// rest of the packages:
//import morgan from "morgan";

// error handler
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";

//app.use(morgan("tiny"));

import cookieParser from "cookie-parser";

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 6 * 100,
    max: 60
  })
);
app.use(express.static("./public"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/orders", orderRoutes);

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(expressMongoSanitize());

// middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = (async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
})();
