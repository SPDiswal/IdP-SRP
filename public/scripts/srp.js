var sha1 = CryptoJS.SHA1;

var a = bigInt("60975527035CF2AD1989806F0407210BC81EDC04E2762A56AFD529DDDA2D4393", 16);

function signIn()
{
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

function hexPad(n, width, z)
{
    z = z || "0";
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function pad(bigInteger)
{
    var result = "";
    var hex = hexPad(bigInteger.toString(16), 256, "0");

    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));

    for (var i = 0; i < bytes.length; i++)
        result += String.fromCharCode(bytes[i]); // parseInt(bytes[i], 2)

    return result;
}

function byteSHA1(bigInteger)
{
    var result = "";
    var hex = bigInteger.toString(16);

    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));

    for (var i = 0; i < bytes.length; i++)
        result += String.fromCharCode(parseInt(bytes[i], 2));

    return sha1(result);
}

function exchangePublicValues(data)
{
    var deferred = Q.defer();
    var username = "alice";//$("#username").val();
    var password = "password123";//$("#password").val();

    var N = bigInt(data.N, 16);
    var g = bigInt(data.g, 16);
    var s = bigInt(data.s, 16);
    //var B = bigInt(data.B, 16);

    // TODO Use random a.
    var A = g.modPow(a, N);
    var b = bigInt("E487CB59D31AC550471E81F00F6928E01DDA08E974A004F49E61F5D105284D20", 16);

    var k = bigInt(sha1(N.toString(16) + g.toString(16)).toString(CryptoJS.enc.Hex), 16);
    var x = bigInt(byteSHA1(s.toString(16) + byteSHA1(username + ":" + password)).toString(CryptoJS.enc.Hex), 16);

    console.log("x: " + x.toString(16));

    var v = g.modPow(x, N).mod(N);

    var B = k.times(v).plus(g.modPow(b, N)).mod(N);
    var u = bigInt(sha1(A.toString(16) + B.toString(16)).toString(CryptoJS.enc.Hex), 16);

    var clientSessionKey = B.minus(k.times(g.modPow(x, N))).modPow(a.plus(u.times(x)), N).mod(N);

    if (clientSessionKey.isNegative()) clientSessionKey = clientSessionKey.plus(N);
    console.log(clientSessionKey.toString(16));



    var serverSessionKey = A.times(v.modPow(u, N)).modPow(b, N).mod(N);

    if (serverSessionKey.isNegative()) serverSessionKey = serverSessionKey.plus(N);
    console.log(serverSessionKey.toString(16));

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