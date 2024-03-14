import express from "express";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import generateToken from "../utils/generateToken.js";
import User from "./../Models/UserModel.js";

const userRouter = express.Router();

// LOGIN
userRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        age: user.age,
        gender: user.gender,
        email: user.email,
        country: user.country,
        tournaments: user.tournaments,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  })
);

// REGISTER
userRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, username, age, gender, country, password, isAdmin } = req.body;

    const userExists = await User.findOne({ email });
    const usernameTaken = await User.findOne({ username });

    if (userExists) {
      res.status(400);
      throw new Error("Email already in use");
    } else if(usernameTaken) {
      res.status(400);
      throw new Error("Username taken")
    }

    const user = await User.create({ email, username, age, gender, country, password, isAdmin });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        username: user.username,
        age: user.age,
        gender: user.gender,
        country: user.country,
        tournaments: [],
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid User Data");
    }
  })
);

// PROFILE
userRouter.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json({
        _id: user._id,
        email: user.email,
        username: user.username,
        age: user.age,
        gender: user.gender,
        country: user.country,
        tournaments: user.tournaments,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// UPDATE PROFILE
userRouter.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.age = req.body.age || user.age;
      user.gender = req.body.gender || user.gender;
      user.email = req.body.email || user.email;
      user.country = req.body.country || user.country;
      user.tournaments = req.body.tournaments || user.tournaments;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        age: updatedUser.age,
        gender: updatedUser.gender,
        email: updatedUser.email,
        country: updatedUser.country,
        tournaments: updatedUser.tournaments,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// CREATE ADMIN USER 
userRouter.post(
  "/admin",
  protect,
  // admin,
  asyncHandler(async (req, res) => {
    const { username, email, password, isAdmin } = req.body;
    const newUserData = {
      username,
      email,
      password,
      isAdmin,
    }
    const admin = await User.findOne({ email });

    if (admin) {
      res.status(400);
      throw new Error("Administrator already exists");
    } else {
      const user = new User(newUserData);
      if (user) {
        const newAdmin = await user.save();
        res.status(201).json({
          id: newAdmin._id,
          username: newAdmin.username,
          email: newAdmin.email,
          isAdmin: newAdmin.isAdmin,
          token: generateToken(newAdmin._id),
        });
      } else {
        res.status(400);
        throw new Error("Invalid user data");
      }
    }

  })
);

// GET ALL USER ADMIN
userRouter.get(
  "/",
  protect,
  // admin,
  asyncHandler(async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
          username: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};
    const count = await User.countDocuments({ ...keyword });
    // const users = await User.find({});
    // res.json(users);
    const users = await User.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
    res.json({ users, page, pages: Math.ceil(count / pageSize) });
  })
);

// ADMIN GET USER PROFILE
userRouter.get(
  "/admin/:id",
  protect,
  // admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// UPDATE USER ADMIN
userRouter.put(
  "/admin/:id",
  protect,
  // admin,
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const user = await User.findById(req.params.id);
    if (user) {
      user.username = username || user.username;
      user.email = email || user.email;
      user.password = password || user.password;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// DELETE USER
userRouter.delete(
  "/admin/:id",
  protect,
  // admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: "User deleted" });
    } else {
      res.status(404);
      throw new Error("User not Found");
    }
  })
);

export default userRouter;