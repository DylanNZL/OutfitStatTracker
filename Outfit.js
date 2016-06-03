/**
 * Created by dylancross on 3/06/16.
 */
    // Required Files
var api_key = require('./api_key.js');
    // Required Node Modules
var prequest = require('prequest'),
    Q = require('q');
    //Global Variables

function fetchTrackingOutfit(outfitTag) {
    var response = Q.defer();
    outfitTag = outfitTag.toLowerCase();
    //URL http://census.daybreakgames.com/get/ps2/outfit/?alias_lower=fclm&c:resolve=leader%28faction_id%29,member_character%28name%29&c:hide=time_created,time_created_date
    //factions: 0 - NS, 1 - VS, 2 - NC, 3 - TR
    var url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2/outfit/?alias_lower=' + outfitTag + '&c:resolve=leader(faction_id),member_character(name)&c:hide=time_created,time_created_date';
    prequest(url).then(function (body) {
        var outfitMembers = [];
        body.outfit_list[0].members.forEach(function(result) {
            if ((result.hasOwnProperty('name')) && (result.name.hasOwnProperty('first'))) {
                outfitMembers.push({
                    character_id: result.character_id,
                    name: result.name.first
                });
            } else {
                console.error('ERROR: there is a character that does not have a name (has been deleted): ' + result.character_id);
            }
        });
        var obj = {
            alias : body.outfit_list[0].alias,
            outfit_id : body.outfit_list[0].outfit_id,
            name : body.outfit_list[0].name,
            faction : body.outfit_list[0].leader.faction_id,
            members : outfitMembers
        };
        response.resolve(obj);
    }).catch(function (err) { // Any HTTP status >= 400 falls here
        response.reject(err);
    });
    return response.promise;
}

function fetchOutfitFromCharacterID(CharID) {
    var response = Q.defer();
    //http://census.daybreakgames.com/get/ps2:v2/outfit_member_extended/?character_id=5428180936948328209
    var url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2:v2/outfit_member_extended/?character_id=' + CharID;
    prequest(url).then(function (body) {
        var obj = {
            alias : body.outfit_member_extended_list[0].alias,
            outfit_id : body.outfit_member_extended_list[0].outfit_id,
            name : body.outfit_member_extended_list[0].name
        };
        response.resolve(obj);
    }).catch(function (err) { // Any HTTP status >= 400 falls here
        response.reject(err);
    });
    return response.promise;
}

exports.fetchTrackingOutfit = fetchTrackingOutfit;
exports.fetchOutfitFromCharacterID = fetchOutfitFromCharacterID;
