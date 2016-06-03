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



/*
function createStream() {
    var ws = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:' + api_key.KEY);
    ws.on('open', function open() {
        console.log('stream opened');
        foreach (Char in Outfit) {
            ws.send('{"service":"event","action":"subscribe","characters":["' + Char + '"],"eventNames":["Death"]}');
        }
        subscribe(ws);
    });
    ws.on('message', function (data) {

    });
    captures = 0;
}
*/