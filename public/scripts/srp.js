var sha1 = CryptoJS.SHA1;

var a = bigInt("60975527035CF2AD1989806F0407210BC81EDC04E2762A56AFD529DDDA2D4393", 16);
var A = bigInt("61D5E490F6F1B79547B0704C436F523DD0E560F0C64115BB72557EC44352E8903211C04692272D8B2D1A5358A2CF1B6E0BFCF99F921530EC8E39356179EAE45E42BA92AEACED825171E1E8B9AF6D9C03E1327F44BE087EF06530E69F66615261EEF54073CA11CF5858F0EDFDFE15EFEAB349EF5D76988A3672FAC47B0769447B", 16);
var N = bigInt("EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3", 16);

function signIn()
{
    //var hash = sha1("Message").toString(CryptoJS.enc.Hex);
    //console.log(hash);

    clientHello().then(exchangePublicValues);
}

function clientHello()
{
    var deferred = Q.defer();
    var username = $("#username").val();

    //$.ajax({
    //    type:        "POST",
    //    url:         "/",
    //    data:        JSON.stringify({ username: username }),
    //    contentType: "application/json",
    //    success:     resolve(deferred),
    //    error:       reject(deferred)
    //});

    resolve(deferred)({
        N: "EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3",
        g: "2",
        s: "BEB25379D1A8581EB5A727673A2441EE",
        B: "BD0C61512C692C0CB6D041FA01BB152D4916A1E77AF46AE105393011BAF38964DC46A0670DD125B95A981652236F99D9B681CBF87837EC996C6DA04453728610D0C6DDB58B318885D7D82C7F8DEB75CE7BD4FBAA37089E6F9C6059F388838E7A00030B331EB76840910440B1B27AAEAEEB4012B7D7665238A8E3FB004B117B58"
    });

    return deferred.promise;
}

function pad(n, width, z)
{
    width = width || 256;
    z = z || "0";
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function exchangePublicValues(data)
{
    var deferred = Q.defer();
    var username = "alice"; //$("#username").val();
    var password = "password123"; // $("#password").val();

    // TODO Read g, generate random a and compute A.

    var N = bigInt(data.N, 16);
    var g = bigInt(data.g, 16);
    var s = bigInt(data.s, 16);
    var B = bigInt(data.B, 16);

    console.log(pad(A.toString(256)));

    var u = bigInt(sha1(pad(A.toString(256)) + pad(B.toString(256))).toString(CryptoJS.enc.Hex), 16);


    //var k = bigInt(sha1(N.toString(256) + pad(g.toString(256))).toString(CryptoJS.enc.Hex), 16);
    //var x = bigInt(sha1(s.toString(256) + CryptoJS.SHA1(username + ":" + password)).toString(CryptoJS.enc.Hex), 16);

    console.log("u: " + u.toString(16).toUpperCase());
    //console.log("k: " + k.toString(16).toUpperCase());
    //console.log("x: " + x.toString(16).toUpperCase());

    //var K = g.pow(new BigInteger("4000000000", 10));

    var K = B.minus(k.times(g.modPow(x, N))).modPow(a.plus(u.times(x)), N).mod(N);
    console.log(K.toString());

    deferred.resolve();

    //$.ajax({
    //    type:        "POST",
    //    url:         "/",
    //    data:        JSON.stringify({ A: A }),
    //    contentType: "application/json",
    //    success:     resolve(deferred),
    //    error:       reject(deferred)
    //});

    return deferred.promise;
}

function resolve(deferred)
{
    return function (data)
    {
        deferred.resolve(data);
    };
}

function reject(deferred)
{
    return function ()
    {
        deferred.reject();
    };
}

$("#signIn").click(signIn);