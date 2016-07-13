/**
 * Created by dylancross on 13/07/16.
 */
var express = require('express');
var bases = require('../bases');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('populate_base_db', { title: 'Populate Bases Database' });
    // Initialise bases
    bases.initialise().then(function (result) {
        if (result) {
            console.log("Bases Initialised");
        } else {
            console.error("Bases did not initialise");
        }
    });
});

module.exports = router;
