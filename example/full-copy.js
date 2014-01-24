var basil = require('..');
var app = basil();

app.use(function (reqA, reqB, resA, resB, data) {
    reqB.hostname = 'www.example.com';
    reqB.port = 80;
    reqB.method = 'GET';
    reqB.path = reqA.url;

    if (data) {
        resA.write(data);
    }
});

app.listen(8999);