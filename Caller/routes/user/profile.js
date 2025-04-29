const express = require("express");
const { verifyuser } = require("../../middleware/authenticantion");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.use(express.json());
router.use(verifyuser);


router.get("/", async (req, res) => {
    try {
        console.log(req.phone_number);
        const user = await prisma.registeredUser.findUnique({
            where: { phoneNumber: req.phone_number },
        });

        if (!user || !user.status) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

router.patch("/", async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;

        await prisma.registeredUser.update({
            where: { phoneNumber: req.phone_number },
            data: { firstName, lastName, email },
        });

        res.status(200).json({ message: "Profile updated." });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

router.delete("/", async (req, res) => {
    try {
        await prisma.registeredUser.update({
            where: { phoneNumber: req.phone_number },
            data: { status: false },
        });

        res.clearCookie("token");
        res.status(200).json({ message: "Profile Deleted." });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});



module.exports = router;

// const z = require("zod");
// router.get("/", async(req,res)=>{
//     try{
//         const user = await prisma.registeredUser.findUnique({
//             where : {phoneNumber : req.phone_number}
//         });
//         if(!user || !user.status){
//             return res.status(400).json({message : "user does not exist"});
//         }
//         res.status(200).json(user);
//     }
//     catch{
//         if(err == z.ZodError){
//             res.status(400).json({message : ""})
//         }
//     }
// });