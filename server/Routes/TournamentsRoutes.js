import express from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import User from "../Models/UserModel.js";
import Tournaments from "../Models/TournamentsModel.js";
import Zimpsl from "../Models/ZimpslModel.js";
import ZimpslPlayerResults from "../Models/ZimsplPlayerResultsModel.js";
import ZimpslPLayerTable from "../Models/ZimpslPlayerTableModel.js";

const tournamentsRoutes = express.Router();

// Get all categories
tournamentsRoutes.get(
    "/categories",
    protect,
    asyncHandler(async (req, res) => {
        const categories = await Tournaments.distinct("category");
        if(categories) {
            res.json(categories);
        } else {
            res.status(404);
            throw new Error("No categories found");
        }
    })
);
// Get all Zimpsl gameweeks
tournamentsRoutes.get(
    "/gameweeks",
    protect,
    asyncHandler(async (req, res) => {
        const gameweeks = await Zimpsl.distinct("gameweek");
        if(gameweeks) {
            res.json(gameweeks);
        } else {
            res.status(404);
            throw new Error("No categories found");
        }
    })
);

// Get all tournaments
tournamentsRoutes.get(
    "/",
    protect,
    asyncHandler(async (req, res) => {
        const tournaments = await Tournaments.find();
        if(tournaments) {
            res.json(tournaments);
        } else {
            res.status(404);
            throw new Error("No tournaments available");
        }
    })
);

// Get tournaments by category
tournamentsRoutes.get(
    "/:category",
    protect,
    asyncHandler(async (req, res) => {
     const tournaments = await Tournaments.find({ category: req.params.category });
     if(tournaments) {
        res.json(tournaments);
     } else {
        res.status(404);
        throw new Error(`${req.params.category} does not exist`)
     }
})
);

// Join zimpsl tournament
tournamentsRoutes.put(
    "/zimpsl/join",
    protect,
    asyncHandler(async (req, res) => {
        const session = await mongoose.startSession();
        const { userId, username, tournament, team } = req.body;

        try {
            session.startTransaction();
            const user = await User.findById(userId);
            // res.json(user.tournaments.length);
        
            if(user) {
                // Check if player is part of tournament
                const tournamentExist = (user.tournaments).some(item => item.tourName === tournament);
                // if((user.tournaments).includes(tournament)) {
                if(tournamentExist) {
                    res.status(400);
                    throw new Error("Already part of the tournament");
                } else {
                    // Add tournament to user model
                    // user.tournaments.push(tournament);
                    user.tournaments.push({tourName:`${tournament}`, playerTeam: `${team}`});
                    const updatedUser = await user.save();

                    // Add user to tournament model
                    const addPlayerToTable = await ZimpslPLayerTable.create({
                        userId,
                        username,
                        team,
                    });
                    if (updatedUser && addPlayerToTable) {
                        await session.commitTransaction();
                        res.status(201).json({ updatedUser, addPlayerToTable });
                    } else {
                        res.status(400);
                        throw new Error("Invalid player data");
                    }
                }
            }
       } catch(error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    })
);

// Get zimpsl fixures and results
tournamentsRoutes.get(
    "/football/zimpsl/:id", // :id is the user objectId
    protect,
    asyncHandler(async (req, res) => {
        const zimpslFixtures = await Zimpsl.find().limit(9).sort({ date: -1 });
        let zimpslPlayerFixtures = [];

        if(zimpslFixtures) {
            for(let zimpslFixture of zimpslFixtures) {
                const checkPlayerPrediction = await ZimpslPlayerResults.find({ userId: req.params.id, fixtureId: zimpslFixture._id });
                if(checkPlayerPrediction.length === 0) {
                    zimpslFixture = { ...zimpslFixture, playerPredicted: false };
                    zimpslPlayerFixtures.push(zimpslFixture);
                } else {
                    zimpslFixture = {
                        ...zimpslFixture,
                        playerPredicted: true,
                        playerResult: checkPlayerPrediction[0]
                    };
                    zimpslPlayerFixtures.push(zimpslFixture);
                }
            };
            // TESTING
            const renderedFixtures = zimpslPlayerFixtures.map(obj => ({
                "_id": obj["_doc"]["_id"],
                "date": obj["_doc"]["date"],
                "gameweek": obj["_doc"]["gameweek"],
                "kickoff": obj["_doc"]["kickoff"],
                "team1": obj["_doc"]["team1"],
                "score1": obj["_doc"]["score1"],
                "team2": obj["_doc"]["team2"],
                "score2": obj["_doc"]["score2"],
                "result": obj["_doc"]["result"],
                "playerPredicted": obj["playerPredicted"],
                "playerResult": obj["playerResult"]
            }));
            res.json(renderedFixtures);
        } else {
            res.status(404);
            throw new Error("No new fixtures")
        }
    })
);

// Get zimpsl fixtures by gameweek
tournamentsRoutes.get(
    "/football/zimpsl/:gameweek/:id",
    protect,
    asyncHandler(async (req, res) => {
        const zimpslFixtures = await Zimpsl.find({ gameweek: req.params.gameweek }).sort({ date: -1 });
        let zimpslPlayerFixtures = [];
        
        if(zimpslFixtures) {
            for(let zimpslFixture of zimpslFixtures) {
                const checkPlayerPrediction = await ZimpslPlayerResults.find({ userId: req.params.id, fixtureId: zimpslFixture._id });
                if(checkPlayerPrediction.length === 0) {
                    zimpslFixture = { ...zimpslFixture, playerPredicted: false };
                    zimpslPlayerFixtures.push(zimpslFixture);
                } else {
                    zimpslFixture = {
                        ...zimpslFixture,
                        playerPredicted: true,
                        playerResult: checkPlayerPrediction[0]
                    };
                    zimpslPlayerFixtures.push(zimpslFixture);
                }
            };
            res.json(zimpslPlayerFixtures);
        } else {
            res.status(404);
            throw new Error("No new fixtures")
        }
    })
);

// Upload zimpsl results per player
tournamentsRoutes.post(
    "/football/zimpsl",
    protect,
    asyncHandler(async (req, res) => {
        const { userId, fixtureId, gameweek, score1, score2 } = req.body;

        const checkPlayerResult = await ZimpslPlayerResults.findOne({ userId, fixtureId });
        if(checkPlayerResult) {
            res.status(400);
            throw new Error("Prediction already exists");
        } else {
            const playerResult = await ZimpslPlayerResults.create({
                userId,
                fixtureId,
                gameweek,
                score1,
                score2,
            });
            if(playerResult) {
                res.status(201).json(playerResult);
            } else {
                res.status(400);
                throw new Error("Failed to add prediction");
            }
        }
    })
);

// Get zimpsl player leaderboard
tournamentsRoutes.get(
    "/football/zimpsl/leaderboard",
    protect,
    asyncHandler(async (req, res) => {
        const pageSize = 40;
        const page = Number(req.query.pageNumber) || 1;
        // const keyword = req.query.keyword
        //     ? {
        //         team: {
        //         $regex: req.query.keyword,
        //         $options: "i",
        //         },
        //     }
        //     : {};
        // const count = await ZimpslPLayerTable.countDocuments({ ...keyword });
        const count = await ZimpslPLayerTable.countDocuments();

        // const playerLeaderboard = await ZimpslPLayerTable.find({ ...keyword })
        const playerLeaderboard = await ZimpslPLayerTable.find()
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ total_points: -1 });
        if(playerLeaderboard) {
            res.json({ playerLeaderboard, page, pages: Math.ceil(count / pageSize) });
        } else {
            res.status(404);
            throw new Error("Player leaderboard not found");
        }
    })
);

// Get zimpsl player leaderboard
tournamentsRoutes.get(
    "/football/zimpsl/leaderboard/:team",
    protect,
    asyncHandler(async (req, res) => {
        const pageSize = 40;
        const page = Number(req.query.pageNumber) || 1;

        const count = await ZimpslPLayerTable.countDocuments({ team: req.params.team });
        const playerTeamLeaderboard = await ZimpslPLayerTable.find({ team: req.params.team })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ total_points: -1 });
        if(playerTeamLeaderboard) {
            res.json({ playerTeamLeaderboard, page, pages: Math.ceil(count / pageSize) });
        } else {
            res.status(404);
            throw new Error("Player leaderboard not found");
        }
    })
);

// Get zimpsl individual play points
tournamentsRoutes.get(
    "/football/zimpsl/leaderboard/:userId",
    protect,
    asyncHandler(async (req, res) => {
        const playerPoints = await ZimpslPLayerTable.find({ userId: req.params.userId });

        if(playerPoints) {
            res.json(playerPoints);
        } else {
            res.status(404);
            throw new Error("Player not found");
        }
    })
);

export default tournamentsRoutes;
