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
       trackedTeamKillDB(data);
    }
    else if (trackedOutfit.members.hasOwnProperty(data.attacker_character_id)) {
        trackedOutfitKillDB(data);
    }
    else if (trackedOutfit.members.hasOwnProperty(data.character_id)) {
        trackedOutfitGotADeath(data);
        database.addDeath(trackedOutfit.members[data.character_id]);
        database.addEventToWeapon(data.attacker_weapon_id, 0, 1, 0);
    }
}

function trackedTeamKillDB(data) {
    // Add Death to Tracked DB
    database.addDeath(data.character_id);
    // Store in History DB
    database.addTrackedDeath(data.timestamp, data.attacker_character_id, data.attacker_weapon_id, data.attacker_loadout_id, data.character_id, data.character_loadout_id, data.is_headshot);
    // Store in weapon DB
    database.addEventToWeapon(data.attacker_weapon_id, 0, 1, 0);
}

function trackedOutfitKillDB(data) {
    // Check if the Character exists in the DB
    database.doesCharacterExist(data.character_id, function (result) {
        if ((result) && (result.length > 0)) {
            // If it does exist, update the deaths of both the character and his outfit (if they're in one)
            database.updateDeathsOfACharacter(data.character_id);
            database.updateOutfitDeaths(result[0].outfit_id);
        } else {
            // If it doesn't fetch the data and store it in the correct DB(s)
            outfit.fetchOutfitFromCharacterID(data.character_id).then(function (res) {
                var obj = res[0].value;
                database.addCharacterDeath(data.character_id, obj.name, obj.rank, obj.faction, obj.outfit_id);
                database.doesOutfitExist(obj.outfit_id, function (r) {
                    if ((r) && (r.length > 0)) {
                        database.updateOutfitDeaths(obj.outfit_id);
                    } else {
                        database.addOutfitWithDeath(obj.outfit_id, obj.outfitName, obj.outfitAlias, obj.faction, obj.outfitCount);
                    }
                });
            });
        }
    });
    // Add Kill to Tracked DB
    database.addKill(data.attacker_character_id, 1, data.is_headshot);
    // Store in history DB
    database.addTrackedKill(data.timestamp, data.attacker_character_id, data.attacker_weapon_id, data.attacker_loadout_id, data.character_id, data.character_loadout_id, data.is_headshot);
    // Store in weapon DB
    database.addEventToWeapon(data.attacker_weapon_id, 1, 0, data.is_headshot);
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
                //console.log(obj.outfit_id + " | " + obj.name + " | " + obj.outfitAlias + " | " + obj.faction + " | " + obj.outfitCount);
                database.addCharacterKill(data.attacker_character_id, obj.name, obj.rank, obj.faction, obj.outfit_id);
                database.doesOutfitExist(obj.outfit_id, function (r) {
                    if ((r) && (r.length > 0)) {
                        database.updateOutfitKills(obj.outfit_id);
                    } else {
                        database.addOutfitWithKills(obj.outfit_id, obj.outfitName, obj.outfitAlias, obj.faction, obj.outfitCount);
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

//Tests:
// mono kills pyro
var d = {
    timestamp: 1468324800000,
    attacker_character_id : "5428010618038027489",
    attacker_weapon_id : 7,
    attacker_loadout_id : 4,
    character_id : "5428010917265719857",
    character_loadout_id : 5,
    is_headshot : 1
};
// kill from a test char
var d1 = {
    timestamp: 1468324800000,
    attacker_character_id : "5428010618038027489",
    attacker_weapon_id : 7,
    attacker_loadout_id : 4,
    character_id : "123456",
    character_loadout_id : 5,
    is_headshot : 1
};
//kill from an unkown char
var d2 = {
    timestamp: 1468324800000,
    attacker_character_id : "5428010618038027489",
    attacker_weapon_id : 7,
    attacker_loadout_id : 4,
    character_id : "5428021759057923985",
    character_loadout_id : 5,
    is_headshot : 1
};

// Teamkill
// trackedTeamKillDB(d);
// Kill
trackedOutfitKillDB(d2);
// Death

exports.createStream = createStream;
