import mongoose from "mongoose";

const singleOrderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
    required: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      required: true
    },
    subTotal: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    orderItems: {
      type: [singleOrderItemSchema]
    },
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "cancelled"],
      default: "pending"
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    clientSecret: {
      type: String,
      required: true
    },
    paymentIntentId: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
