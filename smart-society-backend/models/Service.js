import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
    },
    subcategory: {
      type: String,
      required: [true, "Subcategory is required"],
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Price must be a valid number",
      },
    },
  },
  { timestamps: true }
);

serviceSchema.index(
  { serviceType: 1, category: 1, subcategory: 1 },
  { unique: true }
);

serviceSchema.index({ serviceType: 1 });
serviceSchema.index({ category: 1 });

serviceSchema.pre("save", function () {
  if (this.serviceType) {
    this.serviceType = this.serviceType.toLowerCase().trim();
  }

  if (this.category) {
    this.category = this.category.toLowerCase().trim();
  }

  if (this.subcategory) {
    this.subcategory = this.subcategory.toLowerCase().trim();
  }
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;