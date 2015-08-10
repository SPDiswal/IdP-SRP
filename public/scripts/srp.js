var sha1 = CryptoJS.SHA1;
var aes = CryptoJS.AES;

function random(N)
{
    return bigInt.randBetween(bigInt[2].modPow(bigInt[256], N), bigInt[2].modPow(bigInt[512], N)).modPow(bigInt[2], N);
}

function signIn()
{
    $("#error").hide();
    $("#success").hide();
    $("#message").text("");

    clientHello()
        .then(clientKeyExchange)
        .then(computeSessionKey)
        .then(validateServerProof)
        .then(established)
        .catch(errorHandler);
}

function clientHello()
{
    var deferred = Q.defer();
    var I = $("#username").val();

    $.ajax({
        type:        "POST",
        url:         "/",
        data:        JSON.stringify({ I: I }),
        contentType: "application/json",
        success:     resolve(deferred),
        error:       reject(deferred)
    });

    return deferred.promise;
}

function clientKeyExchange(keys)
{
    var deferred = Q.defer();

    var N = bigInt(keys.N, 16);
    var g = bigInt(keys.g, 16);
    var s = bigInt(keys.s, 16);
    var B = bigInt(keys.B, 16);

    // Checking for ILLEGAL PARAMETER.
    if (B.mod(N).isZero())
    {
        deferred.reject();
        return deferred.promise;
    }

    var a = random(N);
    var A = g.modPow(a, N);

    $.ajax({
        type:        "POST",
        url:         "/",
        data:        JSON.stringify({ A: A.toString(16) }),
        contentType: "application/json",
        success:     resolve(deferred, { N: N, g: g, a: a, A: A, B: B, s: s }),
        error:       reject(deferred)
    });

    return deferred.promise;
}

function computeSessionKey(keys)
{
    var deferred = Q.defer();

    var I = $("#username").val();
    var P = $("#password").val();

    var N = keys.N;
    var g = keys.g;
    var a = keys.a;
    var A = keys.A;
    var B = keys.B;
    var s = keys.s;

    var u = bigInt(sha1(A.toString(16) + B.toString(16)).toString(), 16);
    var k = bigInt(sha1(N.toString(16) + g.toString(16)).toString(), 16);
    var x = bigInt(sha1(s.toString(16) + sha1(I + ":" + P).toString()).toString(), 16);

    // Checking for ILLEGAL PARAMETER.
    if (u.isZero())
    {
        deferred.reject();
        return deferred.promise;
    }

    var S = B.minus(k.times(g.modPow(x, N))).modPow(a.plus(u.times(x)), N).mod(N);
    if (S.isNegative()) S = S.plus(N);

    var K = sha1(S.toString(16)).toString();

    var shaN = bigInt(sha1(N.toString(16)).toString(), 16);
    var shag = bigInt(sha1(g.toString(16)).toString(), 16);

    var xor = shaN.xor(shag);
    var M = sha1(xor.toString(16) + sha1(I).toString() + s.toString(16) + A.toString(16) + B.toString(16) + K).toString();

    $.ajax({
        type:        "POST",
        url:         "/",
        data:        JSON.stringify({ M: M }),
        contentType: "application/json",
        success:     resolve(deferred, { A: A, K: K, M: M }),
        error:       reject(deferred)
    });

    return deferred.promise;
}

function validateServerProof(keys)
{
    var deferred = Q.defer();

    var A = keys.A;
    var K = keys.K;
    var M = keys.M;
    var serverH = keys.H;

    var H = sha1(A.toString(16) + M + K).toString();

    if (H === serverH)
        deferred.resolve({ K: K });
    else
        deferred.reject();

    return deferred.promise;
}

function established(keys)
{
    $("#success").show();

    var sessionKey = keys.K;

    var message = "";
    var messageIndex = Math.floor(Math.random() * (3 - 1)) + 1;

    switch (messageIndex)
    {
        case 1:
            message = "Hello from Earth!";
            break;

        case 2:
            message = "Hello from Earth!";
            break;

        case 3:
            message = "Hello from Earth!";
            break;
    }

    var encryptedMessage = aes.encrypt(message, sessionKey).toString();

    $.ajax({
        type:        "POST",
        url:         "/message",
        data:        JSON.stringify({ message: encryptedMessage }),
        contentType: "application/json",
        success:     function (data)
                     {
                         var decryptedMessage = aes.decrypt(data.message, sessionKey).toString(CryptoJS.enc.Utf8);
                         $("#message").text(decryptedMessage);
                     }
    });
}

function resolve(deferred, predefinedData)
{
    return function (data)
    {
        if (predefinedData)
            deferred.resolve($.extend({}, predefinedData, data));
        else
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

function errorHandler()
{
    $("#error").show();
}

$("#signIn").click(signIn);