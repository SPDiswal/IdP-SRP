var sha1 = CryptoJS.SHA1;

function random(N)
{
    return bigInt.randBetween(bigInt[2].modPow(bigInt[256], N), bigInt[2].modPow(bigInt[512], N)).modPow(bigInt[2], N);
}

function signIn()
{
    clientHello()
    .then(clientKeyExchange)
    .then(computeSessionKey)
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
        data:        { I: I },
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

    //var a = bigInt("60975527035CF2AD1989806F0407210BC81EDC04E2762A56AFD529DDDA2D4393", 16);
    var a = random(N);
    var A = g.modPow(a, N);

    $.ajax({
        type:        "POST",
        url:         "/",
        data:        { A: A.toString(16) },
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
    //var v = g.modPow(x, N);

    // Checking for ILLEGAL PARAMETER.
    if (u.isZero())
    {
        deferred.reject();
        return deferred.promise;
    }

    var S = B.minus(k.times(g.modPow(x, N))).modPow(a.plus(u.times(x)), N).mod(N);
    if (S.isNegative()) S = S.plus(N);

    var K = sha1(S.toString(16)).toString();

    var xor = bigInt(sha1(N.toString(16)).toString()).xor(bigInt(sha1(g.toString(16)).toString()));
    var M = sha1(xor.toString(16) + sha1(I).toString() + s.toString(16) + A.toString(16) + B.toString(16) + K).toString();

    $.ajax({
        type:        "POST",
        url:         "/",
        data:        { M: M },
        contentType: "application/json",
        success:     resolve(deferred, { K: K }),
        error:       reject(deferred)
    });
}

function established(keys)
{
    var K = keys.K;

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
    console.log("ERROR");
}

$("#signIn").click(signIn);