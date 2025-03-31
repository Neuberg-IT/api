var express = require('express');
const { pushData, executePushRequest } = require('./lead_square_sync');
const http = require("http");
var app = express();
const fs = require("fs");
var bodyParser = require('body-parser');
const { getMasterData } = require('./get_master_data');
const { GetThirdPartyregistrationdetailsbymobileno } = require('./transaction');
const { getLead } = require('./lead_square_sync/just_dial');
const { StoreLeadsInfo } = require('./lead_square_sync/store_leads_info');
const { StoreLeadsInfo1 } = require('./lead_square_sync/store_leads_info1');
const { StoreLeadsInfo2 } = require('./lead_square_sync/store_leads_info2');
const { StoreLeadsInfo3 } = require('./lead_square_sync/store_leads_info3');
const helmet = require("helmet");
// use helmet
app.use(helmet());

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.get('/testget', jsonParser, function (req, res) {
  res.send('test get')
})
app.post('/pushData', jsonParser, pushData);
app.post('/executePushRequest', jsonParser, executePushRequest);
app.post('/getMasterData', jsonParser, getMasterData);
app.post('/GetThirdPartyregistrationdetailsbymobileno', jsonParser, GetThirdPartyregistrationdetailsbymobileno);
app.get('/getLead', jsonParser, getLead)
app.post('/StoreLeadsInfo', jsonParser, StoreLeadsInfo)
app.post('/StoreLeadsInfo1', jsonParser, StoreLeadsInfo1)
app.post('/StoreLeadsInfo2', jsonParser, StoreLeadsInfo2)
app.post('/StoreLeadsInfo3', jsonParser, StoreLeadsInfo3)
/*
 app.listen(2099, function () {
    console.log('Server is running..');
});  */


   http
  .createServer({
      // key: fs.readFileSync("security/tutorial.key"),
      // cert: fs.readFileSync("security/tutorial.crt"),
    },app)
  .listen(2098, function () {
    console.log('http Server is running..');
  });  
