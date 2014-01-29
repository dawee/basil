# Basil

Middleware oriented proxy

## About

Basil is a simple but extendable proxy. It makes easy for developers to alter requests and responses.
Basil has no such thing as configuration file or a command line program. 
Requests and Responses can be modified by inserting logical handlers.

## Examples

### 1. Simple "full copy"
```js
var basil = require('basil');
var app = basil();

app.listen(8000);
```


### 2. Log all the requests

```js
var basil = require('basil');
var app = basil();

app.use(function (bundle) {
  if (!bundle.response) {
    console.log(bundle.request.headers);
    console.log(bundle.request.body.toString());
  } 
});

app.listen(8000);
```

### 3. Log all the responses

```js
var basil = require('basil');
var app = basil();

app.use(function (bundle) {
  if (bundle.response) {
    console.log(bundle.response.headers);
    console.log(bundle.response.body.toString());
  } 
});

app.listen(8000);
```

### 4. Always return a 404 code

```js
var basil = require('basil');
var app = basil();

app.use(function (bundle) {
  if (bundle.response) {
    bundle.response.status = 404;
  } 
});

app.listen(8000);
```