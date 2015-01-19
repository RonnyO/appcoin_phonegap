#!/usr/bin/env node

var ncp = require('ncp').ncp;
var transfers = [
    {
        'source': '../client/market/images',
        'destination': './platforms/ios/www/images'
    },
    {
        'source': '../client/market/images',
        'destination': './platforms/android/assets/www/images'
    },
];

ncp.limit = 16;

transfers.forEach(function(transfer) {
  ncp(transfer.source, transfer.destination, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('====== Assets moved from ' + transfer.source + ' to ' + transfer.destination + ' ======');
  });
});