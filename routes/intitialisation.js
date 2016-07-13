/**
 * Created by dylancross on 13/07/16.
 */
var express = require('express'),
    bases   = require('../bases'),
    items   = require('../items');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('initialisation', { title: 'initialisation' });
    // Initialise Bases
    bases.initialise().then(function (result) {
        if (result) {
            console.log("Bases Initialised");
        } else {
            console.error("Bases did not initialise");
        }
    });
    // Initialise Items (weapons)
    items.initialise().then(function (result) {
        if (result) {
            console.log("Items Initialised");
        } else {
            console.error("Items did not initialise");
        }
    });
    
});

module.exports = router;