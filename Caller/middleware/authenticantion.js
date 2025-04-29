const express=require('express');
const cookieparser=require('cookie-parser');
const jwt=require("jsonwebtoken");

const router=express.Router();

router.use(express.json());
router.use(cookieparser());

const JWT_SECRET= "As You Like It";

function verifyuser(req,res,next){
    const token=req.cookies?.token;
    if (!token) {
        //Redirect to login
        return res.status(401).json({ message: "No Token Found! Please log in." });
    }
    try{
        const decodedtoken=jwt.verify(token,JWT_SECRET);
        req.phone_number=decodedtoken.phoneNumber;
        next();
    }catch(err){
        console.error(err);
        if (err.name === "JsonWebTokenError") {
            res.status(401).json({ message: "Invalid Token! Please log in." });
        } else if (err.name === "TokenExpiredError") {
            // Redirect to "/signin"
            res.status(401).json({ message: "Token Expired! Please login again." });
        } else {
            res.status(500).json({ message: "Server Error" });
        }
    }
}

module.exports={
    verifyuser,
}