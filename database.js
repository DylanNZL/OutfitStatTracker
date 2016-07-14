/**
 * Created by dylancross on 27/06/16.
 */
// Required Files
var bookshelf     = require('./bookshelf.js');
// Required Modules

/* ======================================= Data Storage Queries ======================================= */

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
        console.error('addTrackedKill' + err);
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
        console.error('addTrackedDeath' + err);
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
        console.error('addCharacterDeath' + err);
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
        console.error('addCharacterKill' + err);
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
                console.error('updateDeathsOfACharacter' + err);
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
                console.error('updateKillsOfACharacter' + err);
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
            console.error('doesCharacterExist' + data);
            callback(data);
        }
    });
}

/* ========================================== Tracked Queries ========================================== */

// Populates the tracked database
function fillTracked(obj) {
    obj.members.forEach(function (data) {
        var memObj = {
            character_id : data.character_id,
            name : data.name,
            rank : data.rank,
            kills : 0,
            deaths : 0,
            headshots : 0,
            created : Date.now(),
            updated : Date.now()
        };
        bookshelf.knex('tracked').insert(memObj).then(function (data) {

        }).catch(function (err) {
            console.error('fillTracked' + err);
        });
    });
}

// Add a kill & headshot to a characters stats
function addHeadshotKill (mID) {
    bookshelf.knex('tracked').where('character_id', mID).select('kills', 'headshots').then(function (data) {
        var k = data[0].kills; k++;
        var h = data[0].headshots; h++;
        bookshelf.knex('tracked').where('character_id', mID).update({ kills : k, headshots : h }).then(function (res) {

        }).catch(function (err) {
            console.error(err);
        });
    }).catch(function (err) {
        console.error('addHeadshotKill' + err);
    })
}

// Add a kill to a characters stats
function addKill (mID) {
    bookshelf.knex('tracked').where('character_id', mID).select('kills').then(function (data) {
        var k = data[0].kills; k++;
        bookshelf.knex('tracked').where('character_id', mID).update({ kills : k }).then(function (res) {

        }).catch(function (err) {
            console.error('2 addKill' + err);
        });
    }).catch(function (err) {
        console.error('addKill' + err);
    })
}

// Add a death to a characters stats
function addDeath (mID) {
    bookshelf.knex('tracked').where('character_id', mID).select('deaths').then(function (data) {
        var d = data[0].deaths; d++;
        bookshelf.knex('tracked').where('character_id', mID).update({ deaths : d }).then(function (res) {

        }).catch(function (err) {
            console.error('1 addDeath' + err);
        });
    }).catch(function (err) {
        console.error('addDeath' + err);
    })
}

//
function doesTrackedCharExist (mID, callback) {
    bookshelf.knex('tracked').where('character_id', mID).select('character_id').then(function (data) {
        console.log(data);
        callback(data);
    }).catch(function (err) {
        console.error('addDeath' + err);
        callback(false);
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
        console.error('addOutfitWithKill' + err)
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
        console.error('addOutfitWithDeath' + err)
    })
}

// Update Outfit Kills
function updateOutfitKills(mID) {
    bookshelf.knex('outfits').where('outfit_id', mID).select('kills').then(function (data) {
        var dat = data[0].kills;
        dat++;
        bookshelf.knex('outfits').where('outfit_id', mID).update({ kills : dat, updated : Date.now() }).then(function (d) {

        }).catch(function (err) {
            console.error('2 updateOutfitKills' + err);
        })
    }).catch(function (err) {
        console.error('updateOutfitKills' + err);
    })
}

// Update Outfit Deaths
function updateOutfitDeaths(mID) {
    bookshelf.knex('outfits').where('outfit_id', mID).select('deaths').then(function (data) {
        var dat = data[0].deaths;
        dat++;
        bookshelf.knex('outfits').where('outfit_id', mID).update({ deaths : dat }).then(function (d) {

        }).catch(function (err) {
            console.error('2updateOutfitDeaths' + err);
        })
    }).catch(function (err) {
        console.error('updateOutfitDeaths' + err);
    })
}

// Check if an outfit exists in the db
function doesOutfitExist(mID, callback) {
    bookshelf.knex('outfits').where('outfit_id', mID).select('outfit_id').then(function (data) {
        if ((data) && (data.length > 0)) {
            console.log(data);
            callback(true);
        } else {
            console.error('2 updateOutfitDeaths' + data);
            callback(false);
        }
    }).catch(function (err) {
        console.error('doesOutfitExist' + err);
        callback(false);
    })
}

/* ========================================== Items Queries ========================================== */

// populate the weapon database
function populateWeapons (mObj) {
    var obj = {
        weapon_id : mObj._id,
        name : mObj.name,
        category_id : mObj.category_id,
        image_id : mObj.image,
        kills : 0,
        deaths : 0,
        headshots : 0
    };
    bookshelf.knex('weapons').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error('PopulateWeapons ' + mObj.weapon_id + ' ' + err);
    })
}

// Adds a kill/death/headshot to a weapon
function addEventToWeapon (mID, kill, death, headshot) {
    bookshelf.knex('weapons').where('weapon_id', mID).select('kills', 'deaths', 'headshots').then(function(data) {
        if ((data) && (data.length > 0)) {
            var k = kill + data[0].kills;
            var d = death + data[0].deaths;
            var h = headshot + data[0].headshots;
            bookshelf.knex('weapons').where('weapon_id', mID).update({ kills : k, deaths : d, headshots : h }).then(function (res) {
            }).catch(function (err) {
                console.error("addStat update error " + err);
            })
        } else {
            console.error("addStat - No Data" + data);
        }
    }).catch(function (err) {
        console.error("addStat " + err);
    })
}

// checks if an item exists in the database
function doesItemExist (mID, callback) {
    bookshelf.knex('weapons').where('weapon_id', mID).select('name').then(function (data) {
        if ((data) && (data.length > 0)) {
            callback(data);
        } else {
            callback(0);
        }
    }).catch(function (err) {
        console.log('doesItemExist: ' + mID + ' - ' + err);
        callback(0);
    })
}

/* ========================================== Bases Queries ========================================== */

// populate the bases database
function populateBases(mObj) {
    var obj = {
        base_id : mObj.facility_id,
        base_name : mObj.facility_name,
        base_type : mObj.facility_type,
        base_zone_id : mObj.zone_id,
        captures : 0
    };
    bookshelf.knex('bases').insert(obj).then(function (result) {

    }).catch(function (err) {
        console.error('Populate Bases: ' + obj.base_id + ' ' + err);
    })
}

// Adds a base capture into the DB that stores them.
function addBaseCapture(mtime, mID, mPrevFaction, mNewFaction, mOutfitID) {

    var obj = {
        timestamp : mtime,
        base_id : mID,
        previous_faction : mPrevFaction,
        new_faction : mNewFaction,
        outfit_id : mOutfitID
    };
    bookshelf.knex('base_history').insert(obj).then(function (data) {

    }).catch(function (err) {
        console.error('addBaseCapture' + err);
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
                console.error('updateCapturesOfABase id:' + mID + ' ' + err);
            })
        }
    }).catch(function (err) {
        console.error('updateCapturesOfABase' + err);
    })
}

// Checks Base db to see if the base is there.
function doesBaseExist(mID, callback) {
    bookshelf.knex('bases').where('base_id', mID).select('base_id').then(function (data) {
        console.log(data);
        callback(data);
    }).catch(function (err) {
        console.log('doesBaseExist' + err);
        callback(0);
    })
}

/* =========================================== GUI Queries =========================================== */

// grab all the tracked data for GUI
function selectAllTrackedData(callback) {
    bookshelf.knex('tracked').select('character_id','name', 'rank', 'kills', 'deaths', 'headshots').then(function (data) {
        if ((data) && (data.length > 0)) {
            //console.log(data);
            callback(data)
        } else {
            console.error('No data ' + data);
            callback(0);
        }
    }).catch(function (err) {
        console.error('selectAllTrackedData ' + err);
        callback(0);
    })
}

/* ======================================== Character Queries ======================================== */

function selectAllCharacterData(callback) {
    bookshelf.knex('characters').select('character_id','name','kills','deaths','outfit_id').then(function (data) {
        if ((data) && (data.length > 0)) {
            callback(data);
        } else {
            console.error('no data ' + data + '\n selectAllCharacterData');
            callback(0);
        }
    }).catch(function (err) {
        console.error('selectAllCharacterData ' + err);
        callback(0);
    })
}

/* ========================================= Outfit Queries ========================================= */



/* ========================================== Items Queries ========================================== */

function selectAllWeaponData(callback) {
    bookshelf.knex('weapons').select('weapon_id', 'name', 'kills', 'deaths', 'headshots').then(function (data) {
        if ((data) && (data.length > 0)) {
            callback(data);
        } else {
            console.error('No Data in selectAllWeaponData Query ' + data);
            callback(0);
        }
    }).catch(function (err) {
        console.error('selectAllWeaponData ' + err);
        callback(0);
    })
}

/* ========================================== Bases Queries ========================================== */

// grab all the base data for GUI
function selectAllBaseData(callback) {
    bookshelf.knex('bases').select('base_id', 'base_name', 'base_type', 'captures').then(function (data) {
        if ((data) && (data.length > 0)) {
            callback(data);
        } else {
            console.error('No Data ' + data);
            callback(0);
        }
    }).catch(function (err) {
        console.error('selectAllBaseData: ' + err);
        callback(0);
    })
}

// gets the base name of a base from the id
function baseName (mID, callback) {
    bookshelf.knex('bases').where('base_id', mID).select('base_name').then(function (data) {
        if ((data) && (data.length > 0)) {
            callback(data);
        } else {
            callback(0);
        }
    }).catch(function (err) {
        console.error('baseName ' + mID + ' ' + err);
        callback(0);
    })
}

// get the captures of a base, from the id
function baseCaptures(mID, callback) {
    bookshelf.knex('bases').where('base_id', mID).select('captures').then(function (data) {
        if ((data) && (data.length > 0)) {
            callback(data);
        } else {
            console.error('baseCaptures: ' + mID + ' not found');
            callback(0);
        }
    }).catch(function (err) {
        console.error('baseCaptures: ' + mID + ' ' + err);
        callback(0);
    })
}

/* ========================================== Function Tests ========================================== */

// remove for production

/***      Data storage tests      ***/

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


//  Item Function Tests
//      doesItemExist(129, function(data) {
//          if ((data) && (data.length > 0)) {
//              console.log(data);
//          }
//  });
//  addEventToWeapon(1, 1, 1, 1);

/***        GUI Tests        ***/

// tracked tests

/*
selectAllTrackedData(function (data) {
    // print out the returned data
    var obj = JSON.stringify(data);
    console.log('0' + obj);
    // print out an array of names with a kdr (fake atm cause no data).
    data.forEach(function (res) {
        var kdr = (res.kills + 2) / (res.deaths + 1);
        console.error(res.name + ' ' + kdr);
    });
}); */

// Base Tests
/*
selectAllBaseData(function (data) {
    // print out the returned data
    var obj = JSON.stringify(data);
    console.log("result: " + obj);
    // print out all the names
    data.forEach(function (result) {
        console.log(result.base_name);
    });
});*/
/*baseName(123, function (data) {
    // print out the returned data
    var obj = JSON.stringify(data);
    console.log('baseName of 123: ' + obj);
});*/
/*baseCaptures(123, function (data) {
    // print out the returned data
    var obj = JSON.stringify(data);
    console.log('baseCapture of 123: ' + obj);
});*/


/* ============================================= Exports ============================================= */

// Character functions
exports.addTrackedKill              = addTrackedKill;
exports.addTrackedDeath             = addTrackedDeath;
exports.addCharacterKill            = addCharacterKill;
exports.addCharacterDeath           = addCharacterDeath;
exports.updateDeathsOfACharacter    = updateDeathsOfACharacter;
exports.updateKillsOfACharacter     = updateKillsOfACharacter;
exports.doesCharacterExist          = doesCharacterExist;
// Tracked Functions
exports.fillTracked                 = fillTracked;
exports.addHeadshotKill             = addHeadshotKill;
exports.addKill                     = addKill;
exports.addDeath                    = addDeath;
exports.doesTrackedCharExist        = doesTrackedCharExist;
// Outfit Functions
exports.addOutfitWithKill           = addOutfitWithKill;
exports.addOutfitWithDeath          = addOutfitWithDeath;
exports.updateOutfitKills           = updateOutfitKills;
exports.updateOutfitDeaths          = updateOutfitDeaths;
exports.doesOutfitExist             = doesOutfitExist;
// Weapon Functions
exports.populateWeapons             = populateWeapons;
exports.addEventToWeapon            = addEventToWeapon;
exports.doesItemExist               = doesItemExist;
// Base Functions
exports.populateBases               = populateBases;
exports.addBaseCapture              = addBaseCapture;
exports.updateCapturesOfABase       = updateCapturesOfABase;
exports.doesBaseExist               = doesBaseExist;

//GUI
exports.selectAllTrackedData        = selectAllTrackedData;
exports.selectAllCharacterData      = selectAllCharacterData;
exports.selectAllBaseData           = selectAllBaseData;
exports.selectAllWeaponData         = selectAllWeaponData;
