import mongoose from "mongoose";

const zimpslplayerresultsSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        fixtureId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        gameweek: {
            type: Number,
            required: true,
        },
        score1: {
            type: Number,
            required: true,
        },
        score2: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const ZimpslPlayerResults = mongoose.model("ZimpslPlayerResults", zimpslplayerresultsSchema);

export default ZimpslPlayerResults;