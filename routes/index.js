var express   = require('express'),
    bases     = require('../bases'),
    items     = require('../items'),
    database  = require('../database'),
    router    = express.Router(),
    Handlebars= require('hbs');


/* GET home page. */
router.get('/', function(req, res) {
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

Handlebars.registerHelper("kdr", function(kills, deaths) {
  if (deaths == 0) {
    // if no deaths, the kdr will be the total kills
    return kills.toFixed(2);
  }
  var kdr = kills / deaths;
  if (kdr == kdr) {
    return kdr.toFixed(2);
  }
  return 0.0;
});

Handlebars.registerHelper("hsr", function (kills, headshots) {
  var hsr = (headshots / kills) * 100;
  if (hsr == hsr) {
    return hsr.toFixed(2) + '%';
  }
  return '0.0%';
});
module.exports = router;
