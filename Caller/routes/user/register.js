const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { UserSchema } = require("../../functionalities/constraint_validation");

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());

router.post("/", async (req, res) => {
    try {
        UserSchema.parse(req.body);
        const { firstName, lastName, phoneNumber, email, password } = req.body;

        const existing = await prisma.registeredUser.findUnique({
            where: { phoneNumber },
        });

        if (existing && existing.status) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.registeredUser.create({
            data: {
                phoneNumber,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                status: true,
            },
        });

        res.status(201).json({ message: "User successfully signed up" });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

module.exports = router;


// const express = require("express");
// const bcrypt = require("bcrypt");
// const {PrismaClient} = require("@prisma/client");
// const {UserSchema} = require("../../functionalities/constraint_validation");

// const prisma = PrismaClient();
// const router = express.Router();

// router.use(express.json());
// router.post("/",async(req,res)=>{
//     try{
//         UserSchema.parse(req.body);
//         const {firstName,lastName,phoneNumber,email,password} = req.body;
//         const existing = await prisma.registeredUser.findUnique({
//             where : {phoneNumber}
//         });
//         if(existing && existing.status){
//             return res.status(401).json({ error: "User already exists" });
//         }
//         const hashedPassword = await bcrypt.hash(password,10);

//         await prisma.registeredUser.create({
//             data : {
//                 phoneNumber,
//                 firstName,
//                 lastName,
//                 email,
//                 password : hashedPassword,
//                 status : true
//             }
//         });
//         res.status(201).json({ message: "User successfully signed up" });
//     }
//     catch (err) {
//         console.error("Error occurred:", err);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// });

// module.exports = {router};
