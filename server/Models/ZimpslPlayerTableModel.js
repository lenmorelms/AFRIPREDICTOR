import mongoose from "mongoose";

const zimpslplayertableSchema = mongoose.Schema(
    {
        userId: {
            type:  mongoose.Schema.Types.ObjectId,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        team: {
            type: String,
            required: true,
        },
        predicted: {
            type: Number,
            required: true,
            default: 0,
        },
        score: {
            type: Number,
            required: true,
            default: 0,
        },
        result: {
            type: Number,
            required: true,
            default: 0,
        },
        close: {
            type: Number,
            required: true,
            default: 0,
        },
        nopoints: {
            type: Number,
            required: true,
            default: 0,
        },
        total_points: {
            type: Number,
            required: true,
            default: 0,
        },
        // gameweek_points: {
        //     type: Number,
        //     required: true,
        //     default: [],
        // },
    },
    {
        timestamps: true,
    }
);

const ZimpslPLayerTable = mongoose.model("ZimpslPLayerTable", zimpslplayertableSchema);

export default ZimpslPLayerTable;