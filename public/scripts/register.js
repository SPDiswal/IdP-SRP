var sha1 = CryptoJS.SHA1;

function register()
{
    clientRegistrationHello()
        .then(sendRegistration)
        .catch(errorHandler);
}

function clientRegistrationHello()
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

function sendRegistration(keys)
{
    var deferred = Q.defer();

    var I = $("#username").val();
    var P = $("#password").val();

    var N = bigInt(keys.N);
    var g = bigInt(keys.g);
    var s = bigInt(keys.s);

    var x = bigInt(sha1(s.toString(16) + sha1(I + ":" + P).toString()).toString(), 16);
    var v = g.modPow(x, N);

    $.ajax({
        type:        "POST",
        url:         "/",
        data:        { I: I, s: s.toString(16), v: v.toString(16) },
        contentType: "application/json",
        success:     resolve(deferred),
        error:       reject(deferred)
    });

    return deferred.promise;
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

$("#register").click(register);