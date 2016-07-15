var express   = require('express'),
    bases     = require('../bases'),
    items     = require('../items'),
    database  = require('../database'),
    router    = express.Router(),
    Handlebars= require('hbs');


/* GET home page. */
router.get('/', function(req, res, next) {
  getData(res);
});

function getData(res) {
  database.selectAllBaseData(function (result) {
    database.selectAllCharacterData(function (data) {
      database.selectAllTrackedData(function (track) {
        database.selectAllWeaponData(function (weapon) {
          database.selectAllOutfitData(function (outfit) {
            res.render('index', {
              title: 'FCLM Tracker',
              outfits : outfit,
              weapons : weapon,
              tracked : track,
              characters : data,
              bases : result
            });
          });
        });
      });
    });
  });
}

Handlebars.registerHelper("kdr", function(lvalue, rvalue) {
  lvalue = parseInt(lvalue);
  rvalue = parseInt(rvalue);
  return lvalue / rvalue;
});
module.exports = router;
