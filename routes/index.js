const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

var usernames = [];

router.get('/', function(req, res, next) {
  res.sendfile('index.html');
});

router.post('/login', function(req, res, next) {
  usernames.push(req.body.username);
  console.log('all names: ', usernames);
  var token = jwt.sign(req.body.username, 'shhhhhhhhh');

  res.json({
    success: true,
    message: 'Enjoy your token!',
    token: token
  });
})

// router.get('/users/current', function (req, res, next) {
//   res.render('chat');
// })

module.exports = router;
