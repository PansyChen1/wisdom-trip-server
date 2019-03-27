'use strict';
// import UserSchema from "../models/user";
// var UserModel = require('UserModel');

var mongoose = require('mongoose');

var User = require('../models/user');

var xss = require('xss');
var uuid = require('uuid');//用于生成唯一的token
var sms = require('../service/sms');

var db = 'mongodb://localhost:27017/trip-db';
mongoose.Promise = require('bluebird');
mongoose.connect(db, { useNewUrlParser: true });
mongoose.connection.once("open", function() {
  console.log("数据库连接成功");
});

exports.signup = function *(next) {
  // var phoneNumber = this.request.body.phoneNumber;
  var phoneNumber = xss(this.query.phoneNumber.trim());

  var user = yield User.findOne({
    phoneNumber: phoneNumber
  }).exec();

  var verifyCode = sms.getCode();//用来生成验证码

  //判断是否为新用户
  if(!user) {
    var accessToken = uuid.v4();//通过uuid生成token值

    user = new User({
      nickname: "游客",//昵称
      avatar: 'https://www.google.com/search?q=touxiang&tbm=isch&source=iu&ictx=1&fir=P8KLfjMw2wRdiM%253A%252CFDqAZHDz9hwTsM%252C_&vet=1&usg=AI4_-kR94NeG_eYSRHCz4JSaEnRNuH4yDA&sa=X&ved=2ahUKEwicw6rO96HhAhUBqp4KHbjXDwoQ9QEwAXoECAcQBg#imgrc=P8KLfjMw2wRdiM:',
      phoneNumber: xss(phoneNumber),
      verifyCode: verifyCode,
      accessToken: accessToken
    })
  } else {
    user.verifyCode = verifyCode
  }

  //捕捉错误
  try {
    user = yield user.save()
  } catch (e) {
    this.body = {
      success: false
    };
    return next;
  }

  var msg = '您的注册验证码是：' + user.verifyCode;

  try {
    sms.send(user.phoneNumber, msg);
  } catch (e) {
    console.log(e);

    this.body = {
      success: false,
      err: '短信服务异常'
    };
    return next;
  }

  sms.send(user.phoneNumber, msg);

};

exports.verify = function *(next) {
  var verifyCode = this.request.body.verifyCode;
  var phoneNumber = this.request.body.phoneNumber;

  if (!verifyCode || !phoneNumber) {
    this.body = {
      success: false,
      err: '验证未通过',
    };
    return next;
  }

  var user = yield User.findOne({
    phoneNumber: phoneNumber,
    verifyCode: verifyCode
  }).exec();

  if (user) {
    user.verified = true;
    user = yield user.save();

    this.body = {
      success: true,
      data: {
        nickname: user.nickname,
        accessToken: user.accessToken,
        avatar: user.avatar,
        _id: user._id
      }
    }
  } else {
    this.body = {
      success: false,
      err: '验证未通过'
    }
  }
};

exports.update = function *(next) {
  var body = this.request.body;
  var user = this.session.user;

  var fields = 'avatar,nickname'.split(',');

  fields.forEach(function (field) {
    if (body[field]) {
      user[field] = xss(body[field].trim())
    }
  });

  user = yield user.save();

  this.body = {
    success: true,
    nickname: user.nickname,
    assessToken: user.assessToken,
    avatar: user.avatar,
    _id: user._id
  }
};


