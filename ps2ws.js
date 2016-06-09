/**
 * Created by dylancross on 3/06/16.
 */
    // Required files in this project
var api_key   = require('./api_key.js'),
    app       = require('./app.js');
    items     = require('./items.js'),
    bases     = require('./bases.js'),
    outfits   = require('./outfit.js');
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
    if (trackedOutfit.hasOwnProperty(data.attacker_character_id)) {
        trackedOutfitGotAKill(data);
    }
    if (trackedOutfit.hasOwnProperty(data.character_id)) {
        trackedOutfitGotADeath(data);
    }
    console.error("Kill/Death:");
    console.log(app.getOutfitFromID(data.attacker_character_id));
    console.log(items.lookupItem(data.attacker_weapon_id));
    console.log(app.getOutfitFromID(data.character_id));
}

function trackedOutfitGotAKill(data) {
    // Store in to Outfit Kills db
    // To Store: Timestamp | Killer ID | Killer Weapon | Killer Loadout ID | Loser ID | Loser Weapon | Is Headshot |
    //
    var weapon = items.lookupItem(data.attacker_weapon_id);
}

function trackedOutfitGotADeath(data) {
    // Store in to Outfit Deaths db
    // To Store: Timestamp | Killer ID | Killer Weapon | Killer Loadout ID | Loser ID | Loser Weapon | Is Headshot |
    //
    var weapon = items.lookupItem(data.attacker_weapon_id);
}

function itsFacilityData(data) {
    // Check whether the base was capped by the tracked outfit or not
    // If it was store if not, discard
    if (data.new_faction_id != data.old_faction_id) {
        // Will only count it if it was a capture not a defense.
        if (data.outfit_id == trackedOutfit.outfit_id) {
            // The tracked outfit captured a base
            addBaseCaptureToDB(data);
        }
    }
    console.error("Base capture:");
    console.log(data);
    console.log(bases.loookupBase(data.facility_id));
}

function addBaseCaptureToDB(data) {
    // Get base ID
    // To Store: TimeStamp | Factility ID |
    console.log(bases.loookupBase(data.facility_id));
    console.log(data.facility_id);
}

exports.createStream = createStream;
