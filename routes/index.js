var express   = require('express'),
    bases     = require('../bases'),
    items     = require('../items'),
    database  = require('../database'),
    router    = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  getData(res);
});

function getData(res) {
  database.selectAllBaseData(function (result) {
    res.render('index', {
      title: 'FCLM Tracker',
      bases: result
    });
  });
}

module.exports = router;
