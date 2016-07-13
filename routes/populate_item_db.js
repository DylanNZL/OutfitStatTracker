/**
 * Created by dylancross on 13/07/16.
 */
var express = require('express');
var items = require('../items');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('populate_item_db', { title: 'Populate Item Database' });
    items.initialise().then(function (result) {
        if (result) {
            console.log("Items Initialised");
        } else {
            console.error("Items did not initialise");
        }
    });
});

module.exports = router;