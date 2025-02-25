import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: [100, "Name can't exceed 100 characters"]
    },
    price: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg"
    },
    colors: {
      type: [String],
      required: true
    },
    company: {
      type: String,
      required: [true, "company is required"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "'VALUE' is not supported"
      }
    },
    description: {
      type: String,
      trim: true,
      required: [true, "description is required"],
      maxlength: [1000, "Description can't exceed 1000 characters"]
    },
    category: {
      type: String,
      required: [true, "category is required"],
      enum: ["office", "kitchen", "bedroom"]
    },
    featured: {
      type: Boolean,
      default: false
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    inventory: {
      type: Number
    },
    averageRating: {
      type: Number,
      default: 0
    },
    numOfReviews: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false
});

productSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.model("Review").deleteMany({ product: this._id });
  }
);

export default mongoose.model("Product", productSchema);
