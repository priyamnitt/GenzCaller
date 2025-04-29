const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const { verifyuser } = require("./middleware/authenticantion");

app.use(express.json());
app.use(cookieParser());

const register = require("./routes/user/register");
const login = require("./routes/user/login");
const logout = require("./routes/user/logout");
const profile = require("./routes/user/profile");
const addContact = require("./routes/contact/Add_Contacts");
const searchByPhone = require("./routes/search/search_phone_number");
const searchByName = require("./routes/search/search_name");
const reportSpam = require("./routes/spam/report_spam");
const checkSpam = require("./routes/spam/check_spam");

app.use("/user/signup", register);
app.use("/user/signin", login);
app.use("/user/signout", logout);
app.use("/user/profile", profile);
app.use("/user/contact/add", addContact);
app.use("/user/search/phone", searchByPhone);
app.use("/user/search/name", searchByName);
app.use("/user/report/spam", reportSpam);
app.use("/user/check/spam", checkSpam);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Home page" });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}.`);
});