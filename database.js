/**
 * Created by dylancross on 27/06/16.
 */
// Required Files
var Outfit        = require('./outfit'),
    ps2ws         = require('./ps2ws'),
    api_key       = require('./api_key'),
    items         = require('./items.js'),
    bookshelf     = require('./bookshelf.js'),
    bases         = require('./bases.js');
// Required Modules
var knex          = require('knex'),
    Q             = require('q');
// Global Variables


// Insert a tracked outfit kill into the appropriate databases
function addTrackedKill(mTime, mKiller, mWeapon, mLoadout, mLoser, mLoserLoadout, mIsHeadshot) {
    var obj = {
        timestamp : mTime,
        character_id : mKiller,
        weapon : mWeapon,
        loadout : mLoadout,
        loserChar : mLoser,
        loserLoadout : mLoserLoadout,
        IsHeadshot : mIsHeadshot
    };
    bookshelf.knex('trackedKill').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error(err);
    });
}

// Insert a tracked outfit death into a database
function addTrackedDeath(mTime, mKiller, mWeapon, mLoadout, mLoser, mLoserLoadout, mIsHeadshot) {
    var obj = {
        timestamp : mTime,
        character_id : mKiller,
        weapon : mWeapon,
        winnerLoadout : mLoadout,
        loserChar : mLoser,
        loserLoadout : mLoserLoadout,
        IsHeadshot : mIsHeadshot
    };
    console.log(obj);
    bookshelf.knex('trackedDeath').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error(err);
    });
}

// Update the deaths a character has to the tracked outfit
function updateDeathsOfACharacter (char_id) {
    bookshelf.knex('characters').where('character_id', char_id).select('deaths').then(function (data) {
        if ((data) && (data.length > 0)) {
            var dat = data[0].deaths;
            dat++;
            bookshelf.knex('characters').where('character_id', char_id).update({ deaths : dat }).then(function (data) {

            }).catch(function (err) {
                console.error(err);
            });
        }
    });
}

// Update the kills a character has to the tracked outfit
function updateKillsOfACharacter(char_id) {
    bookshelf.knex('characters').where('character_id', char_id).select('kills').then(function (data) {
        if ((data) && (data.length > 0)) {
            var dat = data[0].kills;
            dat++;
            bookshelf.knex('characters').where('character_id', char_id).update({
                kills : dat
            }).then(function (data) {
            }).catch(function (err) {
                console.error(err);
            });
        }
    });
}

// Finds out if a character exists in the character database
function doesCharacterExist (char_id) {
    bookshelf.knex('characters').where('character_id',char_id).select('character_id').then(function (data) {
        if ((data) && (data.length > 0)) {
            console.log(data);
            return true;
        } else {
            console.error(data);
            return false;
        }
    });
}

// Adds a base capture into the DB that stores them.
function addBaseCapture(mtime, mID, mName, mPrevFaction, mNewFaction, mOutfitID) {
    var obj = {
        timestamp : mtime,
        base_id : mID,
        base_name : mName,
        previous_faction : mPrevFaction,
        new_faction : mNewFaction,
        outfit_id : mOutfitID
    };
    bookshelf.knex('base_history').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error(err);
    })
}

// Adds a base to bases DB
function addNewBaseCaptureToCaptures(mID, mName) {
    var obj = {
        base_id : mID,
        base_name : mName,
        captures : 1
    };
    bookshelf.knex('bases').insert(obj).then(function (data) {
        
    }).catch(function (err) {
        console.error(err);
    })
}

// Increments the captures stat by one for the base specified
function updateCapturesOfABase(mID) {
    bookshelf.knex('bases').where("base_id", mID).select("captures").then(function (data) {
        if ((data) && (data.length > 0)) {
            console.log(data);
            var dat = data[0].captures;
            dat++;
            bookshelf.knex('bases').where('base_id', mID).update({ captures : dat }).then(function (d) {

            }).catch(function (err) {
                console.error(err);
            })
        }
    }).catch(function (err) {
        console.error(err);
    })
}

addBaseCapture("123456", "123", "testBase", "1", "2", "789789");

exports.addTrackedKill              = addTrackedKill;
exports.addTrackedDeath             = addTrackedDeath;
exports.updateDeathsOfACharacter    = updateDeathsOfACharacter;
exports.updateKillsOfACharacter     = updateKillsOfACharacter;
exports.doesCharacterExist          = doesCharacterExist;
exports.addBaseCapture              = addBaseCapture;
exports.addNewBaseCaptureToCaptures = addNewBaseCaptureToCaptures;
exports.updateCapturesOfABase       = updateCapturesOfABase;