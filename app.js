var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");

// PAGES
var index = require("./routes/index");
var register = require("./routes/register");
var message = require("./routes/message");

var app = express();

// VIEW ENGINE
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({secret: "srp"}));

// ROUTES
app.use("/", index);
app.use("/register", register);
app.use("/message", message);

// ERROR HANDLERS
// 404.
app.use(function (req, res, next)
{
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// Development.
if (app.get("env") === "development")
{
    app.use(function (err, req, res, next)
    {
        res.status(err.status || 500);
        res.render("error", { message: err.message, error: err });
    });
}

// Production (stack trace not shown).
app.use(function (err, req, res, next)
{
    res.status(err.status || 500);
    res.render("error", { message: err.message, error: {} });
});

module.exports = app;
