import mongoose from "mongoose";
import dotenv from "dotenv";
import validator from "validator";

dotenv.config();

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Rating required"],
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: [true, "Title required"],
      maxlength: 30,
      trim: true
    },
    comment: {
      type: String,
      maxlength: 300,
      trim: true
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true
    }
  },
  { timestamps: true }
);
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId
      }
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating"
        },
        numOfReviews: {
          $sum: 1
        }
      }
    }
  ]);
  console.log(result);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        numOfReviews: result[0]?.numOfReviews || 0,
        averageRating: Math.ceil(result[0]?.averageRating || 0)
      }
    );
  } catch (err) {
    console.error(err);
  }
};

reviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.constructor.calculateAverageRating(this.product);
  }
);

export default mongoose.model("Review", reviewSchema);
