var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({
    statusCode:200,
    message:"Express-Index"
  })
  // res.render('index', { title: 'Express' });
});

module.exports = router;
