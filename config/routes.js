'use strict';

var Router = require('koa-router');
var User = require('../app/controllers/user');
var App = require('../app/controllers/app');

module.exports = function () {
  var router = new Router({
    prefix: "/api"
  });
  //user
  router.get("/signup",App.hasBody, User.signup);
  router.get("/verify",App.hasBody, User.verify);
  router.post("/update",App.hasBody, App.hasToken, User.update);

//app
  router.post("/signature", App.hasBody, App.hasToken, App.signature);

  return router;

};

