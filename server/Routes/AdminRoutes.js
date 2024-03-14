import express from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import User from "../Models/UserModel.js";
import Zimpsl from "../Models/ZimpslModel.js";
import ZimpslPlayerResults from "../Models/ZimsplPlayerResultsModel.js";
import ZimpslPLayerTable from "../Models/ZimpslPlayerTableModel.js";
import Tournaments from "../Models/TournamentsModel.js";

const adminRoutes = express.Router();

// Add tournaments
adminRoutes.post(
    "/tournaments",
    // admin,
    protect,
    asyncHandler(async (req, res) => {
        const { name, category, country } = req.body;

        const checkTournament = await Tournaments.findOne({ name });
        if(checkTournament) {
            res.status(400);
            throw new Error("Tournament already exists");
        } else {
            const tournament = await Tournaments.create({ name, category, country });
            if(tournament) {
                res.status(201).json(tournament);
            } else {
                res.status(400);
                throw new Error("Failed to add tournament");
            }
        }
    })
);

// Delete tournament
adminRoutes.delete(
    "/tournaments/:id",
    // admin,
    protect,
    asyncHandler(async (req, res) => {
        const tournament = await Tournaments.findById(req.params.id);
        if(tournament) {
            await Tournaments.deleteOne({ _id: tournament._id });
            res.json({ message: "Tournament successfully deleted" });
        } else {
            res.status(400);
            throw new Error("Tournament not found");
        }
        // console.log(tournament._id);
    })
);

// Add zimpsl fixtures
adminRoutes.post(
    "/zimpsl/fixtures",
    // admin,
    protect,
    asyncHandler(async (req, res) => {
        const { date, gameweek, kickoff, team1, team2 } = req.body;

        const checkFixture = await Zimpsl.findOne({ gameweek, team1, team2 });
        if(checkFixture) {
            res.status(400);
            throw new Error("Fixture already exists");
        } else {
            const zimpslFixture = await Zimpsl.create({
                date,
                gameweek,
                kickoff,
                team1,
                team2,
            });
            if(zimpslFixture) {
                res.status(201).json(zimpslFixture);
            } else {
                res.status(400);
                throw new Error("Failed to add fixture");
            }
        }
    })
);

// Get zimpsl fixtures and result
adminRoutes.get(
    "/zimpsl/fixtures",
    // admin,
    protect,
    asyncHandler(async (req, res) => {
        const zimpslFixtures = await Zimpsl.find().limit(20).sort({ date: -1, kickoff: -1 });
        if(zimpslFixtures) {
             res.json(zimpslFixtures);
        } else {
            res.status(404);
            throw new Error("No fixtures");
        }
    })
);

// Get the game weeks
adminRoutes.get(
    "/zimpsl/fixtures/gameweeks",
    // admin,
    protect,
    asyncHandler(async (req, res) => {
        const zimpslGameweeks = await Zimpsl.distinct("gameweek");
        if(zimpslGameweeks) {
            res.json(zimpslGameweeks);
        } else {
            res.status(404);
            throw new Error("No gameweeks found");
        }
    })
);

// Get zimpsl fixtures by gameweek
adminRoutes.get(
    "/zimpsl/fixtures/:id",
    // admin,
    protect,
    asyncHandler(async (req, res) => {
        const zimpslFixtures = await Zimpsl.find({ gameweek: req.params.id }).sort({ date: -1, kickoff: -1 });
        if(zimpslFixtures) {
             res.json(zimpslFixtures);
        } else {
            res.status(404);
            throw new Error("No fixtures");
        }
    })
);

// Delete zimpsl fixture
adminRoutes.delete(
    "/zimpsl/fixtures/:id",
    // admin,
    protect,
    asyncHandler(async (req, res) => {
        const zimpslFixture = await Zimpsl.findById(req.params.id);
        if(zimpslFixture) {
            await Zimpsl.deleteOne({ _id: zimpslFixture._id });
            res.json({ message: "Fixture successfully deleted" });
        } else {
            res.status(404);
            throw new Error("Fixture not Found");
        }
    })
);

// Add zimpsl results (updating fixtures)
adminRoutes.put(
    "/zimpsl",
    // admin,
    protect,
    asyncHandler(async (req, res) => {
        const session = await mongoose.startSession();
        const { fixtureId, score1, score2 } = req.body;

        try {
        session.startTransaction();
        const fixture = await Zimpsl.findById(fixtureId);

        if(fixture) {
            if(fixture.result === true) {
                res.status(400);
                throw new Error("Result already exists");
            } else {
                fixture.score1 = score1 || fixture.score1;
                fixture.score2 = score2 || fixture.score2;
                fixture.result = true || fixture.result;
    
                const updatedFixture = await fixture.save();
                // LOGIC FOR AWARDING POINTS
                if(updatedFixture) {
                    const playerResults = await ZimpslPlayerResults.find({ fixtureId: updatedFixture._id });
                    for (var key in playerResults) {
                        if (playerResults.hasOwnProperty(key)) {                        
                            if(updatedFixture.score1 === playerResults[key].score1 && updatedFixture.score2 === playerResults[key].score2) {
                                const playerTable = await ZimpslPLayerTable.find({ userId: playerResults[key].userId });
                                if(playerTable) {
                                    playerTable[0].predicted += 1;
                                    playerTable[0].score += 1;
                                    playerTable[0].total_points += 3;
    
                                    await playerTable[0].save();
                                }
                            } else if((updatedFixture.score1 > updatedFixture.score2 && playerResults[key].score1 > playerResults[key].score2)
                                        || (updatedFixture.score2 > updatedFixture.score1 && playerResults[key].score2 > playerResults[key].score1)
                                        || (updatedFixture.score1 === updatedFixture.score2 && playerResults[key].score1 === playerResults[key].score2) ) {
                                const playerTable = await ZimpslPLayerTable.find({ userId: playerResults[key].userId });
                                if(playerTable) {
                                    playerTable[0].predicted += 1;
                                    playerTable[0].result += 1;
                                    playerTable[0].total_points += 2;
    
                                    await playerTable[0].save();
                                }
                            } else if((updatedFixture.score1+updatedFixture.score2) / (playerResults[key].score1+playerResults[key].score2) <= 1.5) {
                                const playerTable = await ZimpslPLayerTable.find({ userId: playerResults[key].userId });
                                if(playerTable) {
                                    playerTable[0].predicted += 1;
                                    playerTable[0].close += 1;
                                    playerTable[0].total_points += 1;
    
                                    await playerTable[0].save();
                                }
                            } else {
                                const playerTable = await ZimpslPLayerTable.find({ userId: playerResults[key].userId});
                                if(playerTable) {
                                    playerTable[0].predicted += 1;
                                    playerTable[0].nopoints += 1;
                                    playerTable[0].total_points += 0;
                                
                                    await playerTable[0].save();
                                }
                            }
                        }
                    }
                    await session.commitTransaction();
                    res.status(201).json({ updatedFixture });
                } //end
            }
        } else {
            res.status(404);
            throw new Error("Fixture not found");
          }
        } catch(error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    })
);

export default adminRoutes;