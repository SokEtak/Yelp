const mongoose = require("mongoose");
const Review = require("./review");
const { Schema } = mongoose;

// Define image schema
const imageSchema = new Schema(
  {
    url: String,
    filename: String,
  },
);

// Virtual field for thumbnail image
imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

// Options for JSON output
const opts = { toJSON: { virtuals: true } };

// Define campground schema
const campgroundSchema = new Schema(
  {
    title: {
      type: String,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    location: {
      type: String,
    },
    images: [imageSchema],
    description: {
      type: String,
    },
    price: {
      type: Number,
      max: 100,
      min: 1,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    deletedImages: [],
  },
  opts
);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`
});


// Middleware to check if the document exists before deletion
campgroundSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    this.docToDelete = doc;
  }
  next();
});

// Middleware to delete related reviews after deleting the campground
campgroundSchema.post("findOneAndDelete", async function () {
  if (this.docToDelete) {
    await Review.deleteMany({
      _id: {
        $in: this.docToDelete.reviews,
      },
    });
    console.log("Deleted related reviews");
  }
});

// Creating the model
const Campground = mongoose.model("Campground", campgroundSchema);

// Export the model
module.exports = Campground;
