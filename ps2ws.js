/**
 * Created by dylancross on 3/06/16.
 */
    // Required files in this project
var api_key   = require('./api_key.js'),
    app       = require('./app.js');
    items     = require('./items.js'),
    bases     = require('./bases.js'),
    database  = require('./database.js'),
    outfit    = require('./outfit.js');
    // Require Node Modules
var WebSocket = require('ws'),
    fs        = require('fs'),
    io        = require('socket.io');
    // Global Variables
var trackedOutfit;

function alterObject(outfit) {
    // changes the object sent to ps2ws to one that has members named by their character IDs
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
            name : member.name
        };
        if (!outfit_obj.hasOwnProperty(member.character_id)) {
            outfit_obj.members[member.character_id] = obj;
        }
    });
    return outfit_obj;
}

function createStream(outfit) {
    // Opens up a WebSocket connection to the Planetside 2 streaming API
    trackedOutfit = alterObject(outfit);
    var ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);
    ws.on('open', function open() {
        console.log('stream opened');
        outfit.members.forEach(function(Members) {
            //subscribe to each characters kill events
            ws.send('{"service":"event","action":"subscribe","characters":["' + Members.character_id + '"],"eventNames":["Death"]}');
        });
        // Subscribe to Briggs captures
        ws.send('{"service":"event","action":"subscribe","worlds":["25"],"eventNames":["FacilityControl"]}');
    });
    ws.on('message', function (data) {
        //do stuff
        if (data.indexOf("payload") == 2) {
            dealWithData(data);
        }
    });
}

function dealWithData(raw) {
    // decides if data is Player (kills/deaths), Facility or heartbeats (do nothing)
    raw = raw.replace(': :', ':');
    var data = JSON.parse(raw).payload;
    if (data.event_name == "Death") {
        itsPlayerData(data);
    } else if (data.event_name == "FacilityControl") {
        itsFacilityData(data);
    }
}

function itsPlayerData(data) {
    // determines whether the data is for a kill by the tracked outfit or a death.
    if ((trackedOutfit.members.hasOwnProperty(data.attacker_character_id)) && (trackedOutfit.members.hasOwnProperty(data.character_id))) {
        trackedOutfitTeamKilled(data);
        database.addDeath(trackedOutfit.members[data.character_id]);
        database.addEventToWeapon(data.attacker_weapon_id, 0, 1, 0);
    }
    else if (trackedOutfit.members.hasOwnProperty(data.attacker_character_id)) {
        trackedOutfitGotAKill(data);
        if (data.is_headshot) {
            database.addHeadshotKill(trackedOutfit.members[data.attacker_character_id]);
            database.addEventToWeapon(data.attacker_weapon_id, 1, 0, 1);
        } else {
            database.addKill(trackedOutfit.members[data.attacker_character_id]);
            database.addEventToWeapon(data.attacker_weapon_id, 1, 0, 0);
        }
    }
    else if (trackedOutfit.members.hasOwnProperty(data.character_id)) {
        trackedOutfitGotADeath(data);
        database.addDeath(trackedOutfit.members[data.character_id]);
        database.addEventToWeapon(data.attacker_weapon_id, 0, 1, 0);
    }
}

function trackedOutfitTeamKilled(data) {
    trackedOutfitGotAKill(data, items.lookupItem(data.attacker_weapon_id));
    trackedOutfitGotADeath(data, items.lookupItem(data.attacker_weapon_id));

}

function trackedOutfitGotAKill(data) {
    storeTrackedKill(data);
    database.doesCharacterExist(data.character_id, function (result) {
        if ((result) && (result.length > 0)) {
            database.updateDeathsOfACharacter(data.character_id);
            database.updateOutfitDeaths(result.outfit_id);
        } else {
            outfit.fetchOutfitFromCharacterID(data.character_id).then(function (res) {
                var obj = res[0].value;
                database.addCharacterDeath(data.character_id, obj.name, obj.rank, obj.faction, obj.outfitID);
                database.doesOutfitExist(obj.outfitID, function (r) {
                    if ((r) && (r.length > 0)) {
                        database.updateOutfitDeaths(obj.outfitID);
                    } else {
                        database.addOutfitWithDeath(obj.outfitID, obj.name, obj.outfitAlias, obj.faction, obj.members);
                    }
                });
            });
        }
    });
}

function storeTrackedKill(data) {
    // Store kill in tracked Kill table
    database.addTrackedKill(data.timestamp, data.attacker_character_id, data.attacker_weapon_id, data.attacker_loadout_id, data.character_id, data.character_loadout_id,data.is_headshot);
}

function trackedOutfitGotADeath(data) {
    storeTrackedDeath(data, items.lookupItem(data.attacker_weapon_id));
    database.doesCharacterExist(data.attacker_character_id, function (result) {
        if ((result) && (result.length > 0)) {
            database.updateKillsOfACharacter(data.attacker_character_id);
            database.updateOutfitDeaths(result.outfit_id);
        } else {
            outfit.fetchOutfitFromCharacterID(data.attacker_character_id).then(function (res) {
                var obj = res[0].value;
                database.addCharacterKill(data.attacker_character_id, obj.name, obj.rank, obj.faction, obj.outfitID);
                database.doesOutfitExist(obj.outfitID, function (r) {
                    if ((r) && (r.length > 0)) {
                        database.updateOutfitDeaths(obj.outfitID);
                    } else {
                        database.addOutfitWithDeath(obj.outfitID, obj.name, obj.outfitAlias, obj.faction, obj.members);
                    }
                });
            });
        }
    });
}

function storeTrackedDeath(data) {
    // Store the death in the tracked death db
    database.addTrackedDeath(data.timestamp, data.attacker_character_id, data.attacker_weapon_id, data.attacker_loadout_id, data.character_id, data.character_loadout_id,data.is_headshot);
}

function itsFacilityData(data) {
    // Check whether the base was capped by the tracked outfit or not
    // If it was store if not, discard
    if (data.new_faction_id != data.old_faction_id) {
        // Will only count it if it was a capture not a defense.
        if (data.outfit_id == trackedOutfit.outfit_id) {
            // The tracked outfit captured a base
            database.addBaseCapture(data.timestamp, data.facility_id, data.old_previous_id, data.new_faction_id, data.outfit_id);
            database.updateCapturesOfABase(data.facility_id);
        }
    }
}

exports.createStream = createStream;
