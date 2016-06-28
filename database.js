/**
 * Created by dylancross on 27/06/16.
 */
// Required Files
var bookshelf     = require('./bookshelf.js');
// Required Modules

/* ======================================== Character Queries ======================================== */

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
    bookshelf.knex('trackedDeath').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error(err);
    });
}

// Insert a character in to the character db with a death
function addCharacterDeath(mID, mName, mRank, mFaction, mOutfit) {
    var obj = {
        character_id : mID,
        name : mName,
        rank : mRank,
        kills : 0,
        deaths : 1,
        faction : mFaction,
        outfit_id : mOutfit,
        created : Date.now(),
        updated : Date.now()
    };
    bookshelf.knex('characters').insert(obj).then(function (data) {
        
    }).catch(function (err) {
        console.error(err);
    });
}

// Insert a character in to the character db with a kill
function addCharacterKill(mID, mName, mRank, mFaction, mOutfit) {
    var obj = {
        character_id : mID,
        name : mName,
        rank : mRank,
        kills : 1,
        deaths : 0,
        faction : mFaction,
        outfit_id : mOutfit,
        created : Date.now(),
        updated : Date.now()
    };
    bookshelf.knex('characters').insert(obj).then(function (data) {

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
function doesCharacterExist (char_id, callback) {
    bookshelf.knex('characters').where('character_id',char_id).select('outfit_id').then(function (data) {
        if ((data) && (data.length > 0)) {
            console.log(data);
            callback(data);
        } else {
            console.error(data);
            callback(data);
        }
    });
}

/* ========================================== Outfit Queries ========================================== */

// Adds an outfit to the database with one kill
function addOutfitWithKill(mID, mName, mAlias, mFaction, mMembers) {
    var obj = {
        outfit_id : mID,
        name : mName,
        alias : mAlias,
        kills : 1,
        deaths : 0,
        faction : mFaction,
        members : mMembers,
        created : Date.now(),
        updated : Date.now()
    };
    bookshelf.knex('outfits').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error(err)
    })
}

// Adds an outfit to the database with one death
function addOutfitWithDeath(mID, mName, mAlias, mFaction, mMembers) {
    var obj = {
        outfit_id : mID,
        name : mName,
        alias : mAlias,
        kills : 0,
        deaths : 1,
        faction : mFaction,
        members : mMembers,
        created : Date.now(),
        updated : Date.now()
    };
    bookshelf.knex('outfits').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error(err)
    })
}

// Update Outfit Kills
function updateOutfitKills(mID) {
    bookshelf.knex('outfits').where('outfit_id', mID).select('kills').then(function (data) {
        var dat = data[0].kills;
        dat++;
        bookshelf.knex('outfits').where('outfit_id', mID).update({ kills : dat, updated : Date.now() }).then(function (d) {

        }).catch(function (err) {
            console.error(err);
        })
    }).catch(function (err) {
        console.error(err);
    })
}

// Update Outfit Deaths
function updateOutfitDeaths(mID) {
    bookshelf.knex('outfits').where('outfit_id', mID).select('deaths').then(function (data) {
        var dat = data[0].deaths;
        dat++;
        bookshelf.knex('outfits').where('outfit_id', mID).update({ deaths : dat }).then(function (d) {

        }).catch(function (err) {
            console.error(err);
        })
    }).catch(function (err) {
        console.error(err);
    })
}

// Check if an outfit exists in the db
function doesOutfitExist(mID, callback) {
    bookshelf.knex('outfits').where('outfit_id', mID).select('outfit_id').then(function (data) {
        if ((data) && (data.length > 0)) {
            console.log(data);
            callback(true);
        } else {
            console.error(data);
            callback(false);
        }
    }).catch(function (err) {
        console.error(err);
        callback(false);
    })
}

/* =========================================== Base Queries =========================================== */

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

// Checks Base db to see if the base is there.
function doesBaseExist(mID, callback) {
    bookshelf.knex('bases').where('base_id', mID).select('base_id').then(function (data) {
        if ((data) && (data.length > 0)) {
            console.log(data);
            callback(true);
        } else {
            console.error(data);
            callback(false);
        }
    }).catch(function (err) {
        console.log(err);
        callback(false);
    })
}

/* ========================================== Function Tests ========================================== */

//  Character Function Tests
//  addCharacter('1234', "test2", "1", "1", "123");
//  Outfit Function Tests
//  addOutfit('123456', 'test Outfit', 'test', '1', '69');
//  updateOutfitKills(123456);
//  updateOutfitDeaths("123456");
//  doesOutfitExist(123456, function (result) {
//      console.log("we made it");
//  });
//  Base Function Tests


/* ============================================= Exports ============================================= */

// Character functions
exports.addTrackedKill              = addTrackedKill;
exports.addTrackedDeath             = addTrackedDeath;
exports.addCharacterKill            = addCharacterKill;
exports.addCharacterDeath           = addCharacterDeath;
exports.updateDeathsOfACharacter    = updateDeathsOfACharacter;
exports.updateKillsOfACharacter     = updateKillsOfACharacter;
exports.doesCharacterExist          = doesCharacterExist;
// Outfit Functions
exports.addOutfitWithKill           = addOutfitWithKill;
exports.addOutfitWithDeath          = addOutfitWithDeath;
exports.updateOutfitKills           = updateOutfitKills;
exports.updateOutfitDeaths          = updateOutfitDeaths;
exports.doesOutfitExist             = doesOutfitExist;
// Base Functions
exports.addBaseCapture              = addBaseCapture;
exports.addNewBaseCaptureToCaptures = addNewBaseCaptureToCaptures;
exports.updateCapturesOfABase       = updateCapturesOfABase;
exports.doesBaseExist               = doesBaseExist;