/**
 * Created by dylancross on 3/06/16.
 */
    // Required files in this project
var api_key   = require('./api_key.js'),
    items     = require('./items.js');

    // Require Node Modules
var WebSocket = require('ws'),
    fs        = require('fs'),
    io        = require('socket.io');

    // Global Variables

function createStream(outfit) {
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
    });
}

exports.createStream = createStream;
