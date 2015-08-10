var express = require("express");
var router = express.Router();
var aes = require("crypto-js/aes");
var encUtf8 = require("crypto-js/enc-utf8");

router.post("/", function (req, res, next)
{
    var sessionKey = req.session.K;
    var messageFromClient = aes.decrypt(req.body.message, sessionKey).toString(encUtf8);

    var message = "";
    var messageIndex = Math.floor(Math.random() * (4 - 1)) + 1;

    switch (messageIndex)
    {
        case 1:
            message = "Hello from Mars!";
            break;

        case 2:
            message = "Happy summer holidays.";
            break;

        case 3:
            message = "Mein Vater war ein sehr beruhmter Spurhund.";
            break;
    }

    var encryptedResponse = aes.encrypt(messageFromClient + " " + message, sessionKey).toString();
    res.json({ message: encryptedResponse });
});

module.exports = router;
