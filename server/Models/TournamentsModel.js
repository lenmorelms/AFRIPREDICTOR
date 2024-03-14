import mongoose from "mongoose";

const tournamentsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: { // Sport category eg football, cricket
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Tournaments = mongoose.model("Tournaments", tournamentsSchema);

export default Tournaments;