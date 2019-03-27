'use strict';

var mongoose = require('mongoose');

var db = 'mongodb://localhost:27017/trip-db';
mongoose.Promise = require('bluebird');
mongoose.connect(db, { useNewUrlParser: true });
mongoose.connection.once("open", function() {
  console.log("数据库连接成功");
});

var UserSchema = new mongoose.Schema({
  phoneNumber: {
    unique: true,
    type: String
  },
  areaCode: String,
  verifyCode: String,
  verified: {
    type: Boolean,
    default: false
  },
  assessToken: String,
  nickname: String,
  gender: String,
  avatar: String,//头像
  meta: {
    createAt: {
      type: Date,
      dafault: Date.now()
    },
    updateAt: {
      type: Date,
      dafault: Date.now()
    },
  }
});

UserSchema.pre('save', function (next) {

  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
});

var UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;