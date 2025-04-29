const express = require('express');
const router = express.Router();
router.use(express.json());

const { verifyuser } = require("../../middleware/authenticantion");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
router.use(verifyuser);

router.get("/:phonenumber", async (req, res) => {
    const phoneNumber = req.params.phonenumber;

    try {
        let user = await prisma.registeredUser.findUnique({
            where: { phoneNumber },
            select: { spamCount: true }
        });
        if(user){
            return res.status(200).json({ spamCount: user.spamCount });
        }
        let globalUser = await prisma.globalPhoneData.findUnique({
            where: { phoneNumber },
            select: { spamCount: true }
        });
        if (globalUser) {
            return res.status(200).json({ spamCount: globalUser.spamCount });
        }
        return res.status(404).json({ message: "Phone number not found in registered or global database." });

    } catch (error) {
        console.error("Error retrieving spam count:", error);
        res.status(500).json({ error: "Failed to retrieve spam count" });
    }
});

module.exports = router;
