var express = require("express");
var router = express.Router();
var bigInt = require("big-integer");
var NeDB = require("nedb");
var sha1 = require("crypto-js/sha1");
var encHex = require("crypto-js/enc-hex");
var encUtf8 = require("crypto-js/enc-utf8");

var N = bigInt("EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3", 16);
var g = bigInt("2", 16);
var s = bigInt("BEB25379D1A8581EB5A727673A2441EE", 16);
var B = bigInt("BD0C61512C692C0CB6D041FA01BB152D4916A1E77AF46AE105393011BAF38964DC46A0670DD125B95A981652236F99D9B681CBF87837EC996C6DA04453728610D0C6DDB58B318885D7D82C7F8DEB75CE7BD4FBAA37089E6F9C6059F388838E7A00030B331EB76840910440B1B27AAEAEEB4012B7D7665238A8E3FB004B117B58",16);

/* GET home page. */
router.get("/", function (req, res, next)
{
    res.render("index", {title: "Express"});
});

router.post("/", function (req, res, next)
{
    if(req.body.username !== undefined)
    {
        var db = new NeDB({filename: 'data/data.db', autoload: true});
        db.findOne({username: req.body.username}, function (err, doc)
        {
            if (doc)
            {
                req.session.username = doc.username;
                res.send(JSON.stringify({N: N, g: g, s: s, B: B}));
            }
            else
                res.status(400).send();
        });
    }
    else if(req.body.A !== undefined)
    {
        db.findOne({username: req.session.username}, function (err, doc)
        {
            //TODO check if doc is defined
            if(A % N === 0)
                return; //illegal_parameter, sec. 2.5.4

            var A = bigInt(req.body.A, 16);
            var u = bigInt(sha1(A.toString() + B.toString()).toString(encHex), 16);
            var v = bigInt(doc.passwordVerifier.toString(encHex), 16);
            var length = 256;
            var b = bigInt(crypto.randomBytes(Math.ceil(length/2)).toString("hex").slice(0, length));
            var S = Math.pow((A * Math.pow(v, u)), b) % N;
            var K = sha1(sessionKey);

            //req.session.sessionKey = sessionKey;
        });
    }
    else
        res.status(400).send();

});
module.exports = router;
