const express = require("express");
const cookieParser = require("cookie-parser");

const router = express.Router();
router.use(express.json());
router.use(cookieParser());

router.get("/", async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
    });

    res.status(200).json({ message: "User Logged Out!" });
});

module.exports = router;
