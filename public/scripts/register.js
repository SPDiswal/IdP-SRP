function random(N)
{
    return bigInt.randBetween(bigInt[2].modPow(bigInt[256], N), bigInt[2].modPow(bigInt[512], N)).modPow(bigInt[2], N);
}

function register()
{
    clientHello()
        .then(clientKeyExchange)
        .then(computeSessionKey)
        .then(validateServerProof)
        .then(established)
        .catch(errorHandler);

    //var I = $("#username").val();
    //var P = $("#password").val();
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