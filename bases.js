/**
 * Created by dylancross on 6/06/16.
 */
    // Required files
var api_key     = require('./api_key.js');
    // Required modules
var prequest    = require('prequest'),
    Q           = require('q');
    // Global Variables
var bases = {};

var mBaseTemplate = JSON.stringify({
    facility_id : 0,
    zone_id : 0,
    facility_name : 'Unknown',
    facility_type_id : 0,
    facility_type : 'Unknown'
});

function initialise() {
    var response = Q.defer();
    var url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2:v2/zone/?c:join=map_region%5Elist:1%5Einject_at:regions%5Ec:tree=start:regions%5Efield:facility_type%5Elist:1&c:lang=en&c:limit=10&c:show=zone_id,name,regions,facility_id,facility_name,facility_type_id,facility_type';
    prequest(url).then(function (body) {
        body.zone_list.forEach(function (continent) {
            if (continent.hasOwnProperty('regions')) {
                continent.regions.forEach(function (base) {
                    // use base template
                    var obj = JSON.parse(mBaseTemplate);
                    // check if the base response from dbg has each json key before updating template
                    if (base.hasOwnProperty('facility_id')) {
                        obj.facility_id = base.facility_id;
                    }
                    if (base.hasOwnProperty('zone_id')) {
                        obj.zone_id = base.zone_id;
                    }
                    if (base.hasOwnProperty('facility_name')) {
                        obj.facility_name = base.facility_name;
                    }
                    if (base.hasOwnProperty('facility_type_id')) {
                        obj.facility_type_id = base.facility_type_id;
                    }
                    if (base.hasOwnProperty('facility_type')) {
                        obj.facility_type = base.facility_type;
                    }
                    // template is populated, add it to bases as long as it has an ID and isn't already in the object.
                    if ((obj.facility_id > 0) && (!bases.hasOwnProperty(obj.facility_id))) {
                        bases[obj.facility_id] = obj;
                    }
                });
            }
        });
        response.resolve(true);
    }).catch(function (err) {
        console.error(err);
        response.resolve(false);
    });
    return response.promise;
}

function lookupBase(facility_id) {
    if (bases.hasOwnProperty(facility_id)) {
        return bases[facility_id];
    }
    return JSON.parse(mBaseTemplate);
}

/*
// Test bases inside base.js
initialise().then(function (result) {
    console.log(lookupBase(7500)); // should return Hvar tech
    console.log(lookupBase(4401)); // should return Mao tech
});
*/

exports.initialise = initialise;
exports.loookupBase = lookupBase;