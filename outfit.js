/**
 * Created by dylancross on 3/06/16.
 */
    // Required Files
var api_key     = require('./api_key.js');
    // Required Node Modules
var prequest    = require('prequest'),
    Q           = require('q');
    //Global Variables

function fetchTrackingOutfit(outfitTag) {
    // Sends a request to the PS2 API to get the outfit data based on a tag
    var response2 = Q.defer();
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
        response2.resolve(obj);
    }).catch(function (err) { // Any HTTP status >= 400 falls here
        response2.reject(err);
    });
    return response2.promise;
}

function promiseForFetchOutfit(outfitTag) {
    var response3 = Q.defer();
    var promises = [];
    promises.push(fetchTrackingOutfit(outfitTag));
    Q.allSettled(promises).then(function (results) {
        console.log("OBJECT: " + JSON.stringify(results[0].value));
        return response3.promise;
    });
}

function alterObject(outfit) {
    // changes the object to one that has members named by their character IDs
    // makes it easier to check if the kill/death notifications are kills or deaths
    var outfit_obj = {
        alias : outfit.alias,
        outfit_id : outfit.outfit_id,
        name : outfit.name,
        faction : outfit.faction,
        members : {}
    };
    outfit.members.forEach(function(member) {
        var obj = {
            name : member.name,
            kills : 0,
            deaths : 0
        };
        if (!outfit_obj.hasOwnProperty(member.character_id)) {
            outfit_obj.members[member.character_id] = obj;
        }
    });
    return outfit_obj;
}

function fetchOutfitAlias(url) {
    var deferred = Q.defer();
    prequest(url).then(function (body) {
        var obj = {
            name : body.character_list[0].name.first,
            rank : body.character_list[0].battle_rank.value,
            faction : body.character_list[0].faction_id,
            outfitName : body.character_list[0].outfit.name,
            outfitAlias : body.character_list[0].outfit.alias,
            outfitID : body.character_list[0].outfit.outfit_id,
            outfitCount : body.character_list[0].outfit.member_count
        };
        deferred.resolve(obj);
    }).catch(function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
}

function fetchOutfitDataFromAlias(url) {
    var deferred = Q.defer();
    prequest(url).then(function (body) {
        var obj = {
            alias : body.outfit_list[0].alias,
            outfit_id : body.outfit_list[0].outfit_id,
            name : body.outfit_list[0].name,
            faction : body.outfit_list[0].leader.faction_id,
            members : {}
        };
        body.outfit_list[0].members.forEach(function(result) {
            if ((result.hasOwnProperty('name')) && (result.name.hasOwnProperty('first'))) {
                var memObj = {
                    name: result.name.first,
                };
                if (!obj.members.hasOwnProperty(result.character_id)) {
                    obj.members[character_id] = memObj;
                }
            }
        });
        deferred.resolve(obj);
    }).catch(function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
}

function fetchOutfitFromCharacterID(CharID) {
    // sends a request to the PS2 API to get the character data
    // http://census.daybreakgames.com/get/ps2:v2/outfit_member_extended/?character_id=5428180936948328209
    // http://census.daybreakgames.com/get/ps2:v2/character/5428180936948328209?c:resolve=outfit&c:hide=certs,times,title_id,head_id,daily_ribbon,profile_id,battle_rank.percent_to_next,name.first_lower
    var url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2:v2/character/' + CharID + '?c:resolve=outfit&c:hide=certs,times,title_id,head_id,daily_ribbon,profile_id,battle_rank.percent_to_next,name.first_lower';
    var response = Q.defer();
    var promises = [];
    promises.push(fetchOutfitAlias(url));
    Q.allSettled(promises).then(function (result) {
        response.resolve(result);
    });
    return response.promise;
}

exports.fetchTrackingOutfit = fetchTrackingOutfit;
exports.fetchOutfitFromCharacterID = fetchOutfitFromCharacterID;
