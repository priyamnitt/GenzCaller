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
            where: { phoneNumber }
        });
        if (user) {
            await prisma.registeredUser.update({
                where: { phoneNumber },
                data: { spamCount: user.spamCount + 1 }
            });
            return res.status(200).json({ message: "Spam report updated in registered users." });
        }

        let globalUser = await prisma.globalPhoneData.findUnique({
            where: { phoneNumber }
        });

        if (globalUser) {
            await prisma.globalPhoneData.update({
                where: { phoneNumber },
                data: { spamCount: globalUser.spamCount + 1 }
            });
            return res.status(200).json({ message: "Spam report updated in global database." });
        }

        await prisma.globalPhoneData.create({
            data: {
                phoneNumber,
                spamCount: 1,
                notSpamCount: 0 
            }
        });

        res.status(201).json({ message: "Phone number added to global database and marked as spam." });

    } catch (error) {
        console.error("Error reporting spam:", error);
        res.status(500).json({ error: "Failed to report spam" });
    }
});

module.exports = router;
