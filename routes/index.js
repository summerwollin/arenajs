const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('../knexfile')['development']);
const bcrypt = require('bcrypt');

var usernames = [];

router.get('/', function(req, res, next) {
  res.sendfile('index.html');
});

router.post('/login', function(req, res, next) {

  const errors = [];

    if (!req.body.username || !req.body.username.trim()) errors.push("Username can't be blank");
    if (!req.body.password || !req.body.password.trim()) errors.push("Password can't be blank");

    if (errors.length) {
      res.status(422).json({
        errors: errors
      })
    } else {
      knex('users')
        .whereRaw('lower(username) = ?', req.body.username.toLowerCase())
        .first()
        .then(function (thisuser) {

          if (thisuser) {

            if (bcrypt.compareSync(req.body.password, thisuser.password)) {
              var token = jwt.sign(req.body.username, 'shhhhhhhhh');
              res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
              });

            } else {
              res.status(422).json({
                errors: ["Invalid Login"]
              })
            }

          } else {
            res.status(422).json({
              errors: ["Invalid Login"]
            })
          }
        })
    }
})

router.post('/signup', function(req, res, next) {
  const errors = [];

  if (!req.body.username || !req.body.username.trim()) errors.push("Username can't be blank");
  if (!req.body.password || !req.body.password.trim()) errors.push("Password can't be blank");

  if (errors.length) {
    res.status(422).json({
      errors: errors
    })
  } else {
    knex('users')
      .whereRaw('lower(username) = ?', req.body.username.toLowerCase())
      .count()
      .first()
      .then(function (result) {
        if (result.count === "0") {
          const saltRounds = 4;
          const passwordHash = bcrypt.hashSync(req.body.password, saltRounds);

          knex('users')
            .insert({
              username: req.body.username,
              password: passwordHash,
            })
          .returning('*')
          .then(function (users) {
            var token = jwt.sign(req.body.username, 'shhhhhhhhh');
            console.log('mytoken: ', token);
            res.json({
              success: true,
              message: 'Enjoy your token!',
              token: token
            });
          })

        } else {
          res.status(422).json({
            error: "username taken"
          })
        }
      })
    }
})

router.post('/guest', function(req, res, next) {
  var name = 'guest' + Math.floor(Math.random() * 100);
  console.log('~~~~~~~~~~~~~', name);
  var token = jwt.sign(name, 'shhhhhhhhh');
  res.json({
    success: true,
    message: 'Enjoy your token!',
    token: token
  });

})


module.exports = router;
