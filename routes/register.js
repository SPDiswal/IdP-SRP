var express = require("express");
var router = express.Router();
var bigInt = require("big-integer");
var NeDB = require("nedb");

var N = bigInt("EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3", 16);
var g = bigInt("2", 10);

function random()
{
    return bigInt.randBetween(bigInt[2].modPow(bigInt[256], N), bigInt[2].modPow(bigInt[512], N)).modPow(bigInt[2], N);
}

function exchangeSaltAndKeys(req, res)
{
    var s = random();
    res.json({ N: N.toString(16), g: g.toString(16), s: s.toString(16) });
}

function registerUser(req, res)
{
    var db = new NeDB({ filename: "data/data.db", autoload: true });

    db.findOne({ I: req.body.I }, function (err, doc)
    {
        if (doc)
            res.redirect("/register?error=1");
        else
        {
            db.insert({
                I: req.body.I,
                s: req.body.s,
                v: req.body.v
            }, function ()
            {
                res.redirect("/");
            });
        }
    });
}

router.get("/", function (req, res, next)
{
    res.render("register", { title: "Express" });
});

router.post("/", function (req, res, next)
{
    if (req.body.I)
        registerUser(req, res);
    else
        exchangeSaltAndKeys(res);
});

module.exports = router;
