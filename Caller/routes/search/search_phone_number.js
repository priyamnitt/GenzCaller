const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { verifyuser } = require("../../middleware/authenticantion");

router.use(express.json());
router.use(verifyuser);

const prisma = new PrismaClient();

router.get("/:phoneNumber", async (req, res) => {
    try {
        const searcherPhoneNumber = req.phone_number;
        const targetPhoneNumber = req.params.phoneNumber;
        // console.log(searcherPhoneNumber,targetPhoneNumber);
        const registeredUser = await prisma.registeredUser.findUnique({
            where: { phoneNumber: targetPhoneNumber },
            select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true, 
                spamCount: true,
            }
        });

        if (registeredUser) {
            let spamLikelihood = "Unknown";
            const totalVotes = registeredUser.spamCount + registeredUser.notSpamCount;
            if (totalVotes > 0) {
                const spamRatio = registeredUser.spamCount / totalVotes;
                spamLikelihood = spamRatio > 0.7 ? "High" : spamRatio > 0.3 ? "Medium" : "Low";
            }
            const isInContactList = await prisma.contact.findFirst({
                where: {
                    ownerPhoneNumber: targetPhoneNumber,
                    savedNumber: searcherPhoneNumber
                }
            });
            return res.status(200).json({
                type: "Registered User",
                firstName: registeredUser.firstName,
                lastName: registeredUser.lastName,
                phoneNumber: registeredUser.phoneNumber,
                email: isInContactList ? registeredUser.email : null, 
                spamLikelihood
            });
        }
        const globalEntry = await prisma.globalPhoneData.findUnique({
            where: { phoneNumber: targetPhoneNumber },
            select: {
                phoneNumber: true,
                spamCount: true,
                notSpamCount: true,
                savedNames: {
                    select: { name: true }
                }
            }
        });
        if (globalEntry) {
            return res.status(200).json({
                type: "Global Data",
                phoneNumber: globalEntry.phoneNumber,
                spamCount: globalEntry.spamCount,
                notSpamCount: globalEntry.notSpamCount,
                savedNames: globalEntry.savedNames.map(nameObj => nameObj.name)
            });
        }
        return res.status(404).json({ message: "No records found for this phone number" });

    } catch (error) {
        console.error("Error searching for phone number:", error);
        res.status(500).json({ error: "Failed to retrieve search results" });
    }
});

module.exports = router;
