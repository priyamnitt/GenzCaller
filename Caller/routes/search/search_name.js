const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
router.use(express.json());

router.get("/:name", async (req, res) => {
    const searchQuery=req.params.name;
    try {
        const results = await prisma.savedName.findMany({
            where: {
                OR: [
                    { name: {startsWith: searchQuery, mode: "insensitive"} },
                    { name: {contains: searchQuery, mode: "insensitive"}}
                ]
            },
            include: {
                globalData: {
                    select: {
                        phoneNumber: true,
                        spamCount: true,
                        notSpamCount: true
                    }
                }
            }
        });

        if (results.length === 0) {
            return res.status(404).json({ message: "No results found for this name." });
        }
        const uniqueResults = new Map();
        results.forEach(entry => {
            if (!uniqueResults.has(entry.globalData.phoneNumber)) {
                uniqueResults.set(entry.globalData.phoneNumber, {
                    name: entry.name,
                    phoneNumber: entry.globalData.phoneNumber,
                    spamLikelihood: calculateSpamRisk(entry.globalData.spamCount, entry.globalData.notSpamCount)
                });
            }
        });

        res.status(200).json(Array.from(uniqueResults.values()));
    } catch (error) {
        console.error("Error searching for name:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
function calculateSpamRisk(spamCount, notSpamCount) {
    if (spamCount === 0) return "Low";
    const spamRatio = spamCount / (spamCount + notSpamCount);
    if (spamRatio > 0.7) return "High";
    if (spamRatio > 0.3) return "Medium";
    return "Low";
}
module.exports = router;
