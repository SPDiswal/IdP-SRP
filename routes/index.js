var express = require("express");
var router = express.Router();
var bigInt = require("big-integer");
var NeDB = require("nedb");
var sha1 = require("crypto-js/sha1");

var N = bigInt("EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3", 16);
var g = bigInt("2", 10);

function random()
{
    return bigInt.randBetween(bigInt[2].modPow(bigInt[256], N), bigInt[2].modPow(bigInt[512], N)).modPow(bigInt[2], N);
}

function serverKeyExchange(req, res)
{
    var db = new NeDB({ filename: "data/data.db", autoload: true });

    db.findOne({ I: req.body.I }, function (err, doc)
    {
        if (doc)
        {
            var I = doc.I;
            var s = bigInt(doc.s, 16);
            var v = bigInt(doc.v, 16);

            var b = random();
            var k = bigInt(sha1(N.toString(16) + g.toString(16)).toString(), 16);
            var B = k.multiply(v).plus(g.modPow(b, N)).mod(N);

            req.session.I = I;
            req.session.s = s.toString(16);
            req.session.v = v.toString(16);
            req.session.k = k.toString(16);
            req.session.b = b.toString(16);
            req.session.B = B.toString(16);

            res.json({ N: N.toString(16), g: g.toString(16), s: s.toString(16), B: B.toString(16) });
        }
        else
            res.sendStatus(400);
    });
}

function computeSessionKey(req, res)
{
    var db = new NeDB({ filename: "data/data.db", autoload: true });

    var I = req.session.I;
    var s = bigInt(req.session.s, 16);
    var v = bigInt(req.session.v, 16);
    var k = bigInt(req.session.k, 16);
    var b = bigInt(req.session.b, 16);
    var B = bigInt(req.session.B, 16);

    var A = bigInt(req.body.A, 16);

    // Checking for ILLEGAL PARAMETER.
    if (A.mod(N).isZero())
    {
        res.sendStatus(400);
        return;
    }

    db.findOne({ I: I }, function (err, doc)
    {
        if (doc)
        {
            var u = bigInt(sha1(A.toString(16) + B.toString(16)).toString(), 16);
            var S = A.multiply(v.modPow(u, N)).modPow(b, N);

            var K = sha1(S.toString(16)).toString();

            console.log(K);

            req.session.A = A.toString(16);
            req.session.K = K;

            res.sendStatus(200);
        }
        else
            res.sendStatus(400);
    });
}

function validateClientProof(req, res)
{
    var I = req.session.I;
    var s = bigInt(req.session.s, 16);
    var A = bigInt(req.session.A, 16);
    var B = bigInt(req.session.B, 16);
    var K = req.session.K;
    var clientM = req.body.M;

    var shaN = bigInt(sha1(N.toString(16)).toString(), 16);
    var shag = bigInt(sha1(g.toString(16)).toString(), 16);

    var xor = shaN.xor(shag);
    var M = sha1(xor.toString(16) + sha1(I).toString() + s.toString(16) + A.toString(16) + B.toString(16) + K).toString();

    if (M === clientM)
    {
        var H = sha1(A.toString(16) + M + K).toString();
        res.json({ H: H });
    }
    else
        res.sendStatus(400);
}

router.get("/", function (req, res, next)
{
    res.render("index", { title: "Express" });
});

router.post("/", function (req, res, next)
{
    if (req.body.I)
        serverKeyExchange(req, res);
    else if (req.body.A)
        computeSessionKey(req, res);
    else if (req.body.M)
        validateClientProof(req, res);
    else
        res.sendStatus(400);
});

module.exports = router;
