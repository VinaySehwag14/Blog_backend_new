const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
//* register user

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      "process.env.Sec_Pass"
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(req.body.password, salt);

//     const newUser = new User({
//       username: req.body.username,
//       email: req.body.email,
//       password: hashedPassword,
//     });

//     const user = await newUser.save();
//     res.status(200).json(user);
//   } catch (err) {
//     console.log(err);

//     res.status(500).json({ err: "username is already in use" });
//   }
// });

//* login user
// router.post("/login", async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     !user && res.status(400).json("Incorrect Username");

//     const validated = await bcrypt.compare(req.body.password, user.password);
//     !validated && res.status(400).json("Incorrect Password");

//     const accessToken = jwt.sign(
//       { id: user._id, username: user.username },
//       process.env.SECRET_KEY,
//       {
//         expiresIn: "2d",
//       }
//     );

//     const { password, ...info } = user._doc;

//     return res.status(200).json({ ...info, accessToken });
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// });

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong credentials!");

    const hashedPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.Sec_Pass
    );

    const OriginalPassword = hashedPass.toString(CryptoJS.enc.Utf8);

    OriginalPassword !== req.body.password &&
      res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    //*sending accesstoken to client and spreading for making one object
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(Error);
  }
});

module.exports = router;
