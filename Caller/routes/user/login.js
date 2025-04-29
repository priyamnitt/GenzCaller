const express = require("express");
const bcrypt = require("bcrypt");
const z = require("zod");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");
const { UserSchema } = require("../../functionalities/constraint_validation");

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET= "As You Like It";
router.use(express.json());
router.use(cookieParser());

router.post("/", async (req, res) => {
    try {
        UserSchema.parse(req.body);
        const { phoneNumber, password } = req.body;

        const existing = await prisma.registeredUser.findUnique({
            where: { phoneNumber },
        });

        if (!existing || !existing.status) {
            return res.status(403).json({ error: "User doesn't exist" });
        }

        const isValid = await bcrypt.compare(password, existing.password);
        if (!isValid) {
            return res.status(403).json({ message: "Forbidden! Wrong Password!" });
        }

        const token = jwt.sign({phoneNumber}, JWT_SECRET, { expiresIn: "12h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 12 * 60 * 60 * 1000, 
        });

        res.status(200).json({ message: "User Signed In!", token });

    } catch (err) {
        console.error("Error occurred:", err);
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation Error", errors: err.errors });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;


// const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const {PrismaClient} = require("@prisma/client");
// const z = require("zod");
// const {UserSchema} = require("../../functionalities/constraint_validation");

// const router = express.Router();
// const prisma = new PrismaClient();
// router.use(express.json());
// router.use(cookieParser());

// router.post("/",async(req,res)=>{
//     try{
//         UserSchema.parse(req.body);
//         const{phoneNumber,password} = req.body;
//         const existing = await prisma.registeredUser.findUnique({
//             where : {phoneNumber}
//         });
//         if(!existing || !existing.status){
//             return res.status(401).json({error: "User doesn't exist"});
//         }
//         const isValid = bcrypt.compare(password,existing.password);
//         if(!isValid){
//             return res.status(403).json({ message: "Forbidden! Wrong Password!" });
//         }

//         const token = jwt.sign({phoneNumber},JWT_SECRET,{expiresIn : "12h"});

//         res.cookie("token",token,{
//             httpOnly : true,
//             secure : process.env.NODE_ENV === "production",
//             maxAge : 12*60*60*1000
//         });

//         res.status(200).json({message: "user signed in"});


//     }
//     catch(err){
//         if(err instanceof z.ZodError){
//             return res.status(400).json({message : "Validation Error"})
//         }
//         res.status(500).json({message : "internal server error"});
//     }
// });

// module.exports = {router};
