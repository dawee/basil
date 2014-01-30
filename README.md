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

## What's the bundle object ?

As you see, your functions are called for each requests and responses.
Everytime you'll get a **bundle object**.

Here is its structure :

* **bundle.request** : the options object you usually give to [http.request](http://nodejs.org/api/http.html#http_http_request_options_callback)
* **bundle.request.headers** : An object model of the HTTP headers the client sent.
* **bundle.request.body** : the [Buffer](http://nodejs.org/api/buffer.html) object of the request body (normally in POST requests).

In case you are response side you'll get :

* **bundle.response.status** : The status code that will be returned
* **bundle.response.headers** : An object model of the HTTP headers the client will receive.
* **bundle.response.body** : the [Buffer](http://nodejs.org/api/buffer.html) object of the returned data.

In the bundle object, **everything can be read/written.**
