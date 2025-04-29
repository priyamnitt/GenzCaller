const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { verifyuser } = require("../../middleware/authenticantion");

router.use(express.json());
router.use(verifyuser);

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    try {
        const contacts = req.body.contacts || [];
        if (contacts.length === 0) {
            return res.status(400).json({ error: "No contacts provided" });
        }
        const ownerPhoneNumber = req.phone_number;
        const contactDetails = contacts.map((contact) => ({
            ownerPhoneNumber,
            savedNumber: contact.savedNumber,
            savedName: contact.savedName,
        }));
        await prisma.contact.createMany({
            data: contactDetails,
            skipDuplicates: true, 
        });
        const phoneNumbers = contacts.map((contact) => contact.savedNumber);
        const existingGlobalData = await prisma.globalPhoneData.findMany({
            where: { phoneNumber: { in: phoneNumbers } },
            include: { savedNames: true },
        });
        const existingGlobalDataMap = new Map();
        existingGlobalData.forEach((data) => {
            existingGlobalDataMap.set(data.phoneNumber, data);
        });
        const globalPhoneDataToCreate = [];
        const savedNamesToCreate = [];
        for (const contact of contacts) {
            const existingData = existingGlobalDataMap.get(contact.savedNumber);
            if (existingData) {
                const nameExists = existingData.savedNames.some(
                    (savedName) => savedName.name === contact.savedName
                );
                if (!nameExists) {
                    savedNamesToCreate.push({
                        phoneNumber: contact.savedNumber,
                        name: contact.savedName,
                    });
                }
            } else {
                globalPhoneDataToCreate.push({
                    phoneNumber: contact.savedNumber,
                    spamCount:0,
                    notSpamCount: 0,
                });
                savedNamesToCreate.push({
                    phoneNumber: contact.savedNumber,
                    name: contact.savedName,
                });
            }
        }
        if (globalPhoneDataToCreate.length > 0) {
            await prisma.globalPhoneData.createMany({
                data: globalPhoneDataToCreate,
                skipDuplicates: true,
            });
        }
        if (savedNamesToCreate.length > 0) {
            await prisma.savedName.createMany({
                data: savedNamesToCreate,
                skipDuplicates: true,
            });
        }
        res.status(201).json({
            message: "Contacts uploaded and global database updated successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to upload contacts" });
    }
});

module.exports = router;
