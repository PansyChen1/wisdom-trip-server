'use strict'
var koa = require('koa');
var logger = require('koa-logger');
var session = require('koa-session');
var bodyParser = require('koa-bodyParser');
var app = new koa();

app.key = ['trip'];
app.use(logger());
app.use(session(app));
app.use(bodyParser());

app.use(function *(next) {
  console.log(this.href);
  console.log(this.method);
  this.body = {
    success: true
  }
  yield next
})

app.listen(1234);
console.log('Listen success');