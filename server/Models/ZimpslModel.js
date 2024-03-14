import mongoose from "mongoose";

const zimpslSchema = mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
        },
        gameweek: {
            type: Number,
            required: true,
        },
        kickoff: {
            type: String,
            required: true,
        },
        team1: {
            type: String,
            required: true,
        },
        score1: {
            type: Number,
            required: true,
            default: 0,
        },
        team2: {
            type: String,
            required: true,
        },
        score2: {
            type: Number,
            required: true,
            default: 0,
        },
        result: {
            type: Boolean,
            required: true,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

const Zimpsl = mongoose.model("Zimpsl", zimpslSchema);

export default Zimpsl;