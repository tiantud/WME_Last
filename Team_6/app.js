//init app with express, util, body-parser, csv2json
var express = require('express');
var app = express();
var sys = require('util');
var path = require('path');
var bodyParser = require('body-parser');
var Converter = require("csvtojson").Converter;

//register body-parser to handle json from res / req
app.use( bodyParser.json() );

//register public dir to serve static files (html, css, js)
app.use( express.static( path.join(__dirname, "public") ) );


/**************************************************************************
****************************** csv2json *********************************
**************************************************************************/
//Converter Class -> read csv file and create jsonObj
var converter = new Converter({
    delimiter: ","
});
var jsonStruct_countrys = "";
//end_parsed will be emitted once parsing finished
converter.on("end_parsed", function (jsonObject) {
   jsonStruct_countrys = jsonObject;
   updateJSONFile();
});
//read from file
require("fs").createReadStream("./world_data.csv").pipe(converter);

/**************************************************************************
****************************** handle HTTP GET req ******************
**************************************************************************/
// get root - disabled because we serve static files on our root: /
/*app.get('/', function (req, res) {
  res.send("Welcome to the world_data API.");
  updateJSONFile();
});*/

// GET all items as json
app.get('/items', function (req, res) {
  res.send( JSON.stringify(jsonStruct_countrys) );
});

// GET single item by id
app.get('/items/:id', function (req, res) {
    var jsonStruct_country_found = "";
    var found = false;
    for (var i=0; i < jsonStruct_countrys.length; i++) {
        if (jsonStruct_countrys[i].id == req.params.id) {
            jsonStruct_country_found = jsonStruct_countrys[i];
            found = true;
        }
    }
    if (!found) {
        jsonStruct_country_found = "No such ID in database.";
    }

    res.send( JSON.stringify(jsonStruct_country_found) );
});

// GET range by two ids
app.get('/items/:id/:id2', function (req, res) {
    var jsonStruct_countrys_found = [];
    var found = false;

    //pre check if range exist in array
    var id_min = req.params.id;
    var id_max = req.params.id2;
    if ( id_max > jsonStruct_countrys.length ) {
        id_max = jsonStruct_countrys.length;
    } else if ( id_min > jsonStruct_countrys.length ) {
        id_min = jsonStruct_countrys.length;
        id_max = jsonStruct_countrys.length;
    }

    for (var i=0; i < jsonStruct_countrys.length; i++) {
        if (jsonStruct_countrys[i].id >= id_min && jsonStruct_countrys[i].id <= id_max) {
            jsonStruct_countrys_found.push( jsonStruct_countrys[i] );
            found = true;
        }
    }
    if (!found) {
        jsonStruct_countrys_found = "No such ID in database.";
    }

    res.send( JSON.stringify(jsonStruct_countrys_found) );
});

// GET all properties
app.get('/properties', function (req, res) {
    var keys = Object.keys(jsonStruct_countrys[0]);
    res.send( keys );
});

// GET property by id 0-13
app.get('/properties/:id', function (req, res) {

    var keys = Object.keys(jsonStruct_countrys[0]);
    var response = "1";
    if (req.params.id <= keys.length){
        response = keys[req.params.id];
    } else {
        response = "No such property available.";
    }

    res.status(200).send(JSON.stringify(response));
});
/*
// GET name and data of selected property from all country
app.get('/selected_property/:id', function (req, res) {
    var jsonStruct_country_found = "";
    var found = false;
    var keys = Object.keys(jsonStruct_countrys[0]);
    for (var i=0; i < jsonStruct_countrys.length; i++) {
        jsonStruct_countrys_found.push( jsonStruct_countrys[i] );
        for(var j=0; j < keys.length; j++){
            if(j!=0 || j!=req.params.id){
                var shabi_key = key[j];
                delete.jsonStruct_countrys_found[i].shabi_key;
            }
        }
    }
    if (!found) {
        jsonStruct_country_found = "No such property avalable.";
    }

    res.send( JSON.stringify(jsonStruct_country_found) );
});*/

//delete last item - BROWSER GET
app.get('/delete', function(req, res) {
    if ( jsonStruct_countrys.length > 0 ) {
        jsonStruct_countrys.pop();
        updateJSONFile();
    }
    res.send( jsonStruct_countrys );
});

// delete item by id - BROWSER GET
app.get('/delete/:id', function(req, res) {
    var msg = "";
    var deleted = false;
    for (var i=0; i < jsonStruct_countrys.length; i++) {
        if (jsonStruct_countrys[i].id == req.params.id) {
            jsonStruct_countrys.splice(i, 1);
            deleted = true;
            msg = "Item " + i + " deleted successfully!";
            reassignIDs();
            updateJSONFile();
        }
    }
    if (!deleted) {
        msg = "Cannot delete! No such ID in database.";
    }

    res.send( msg + "<br/><br/><br/>" + JSON.stringify(jsonStruct_countrys) );
});

/**************************************************************************
****************************** handle POST, DELETE req ************
**************************************************************************/
// helper functions
// assign new ids on delete or add
function reassignIDs() {
    for (var i=0; i < jsonStruct_countrys.length; i++) {
        if (i < 10)
            jsonStruct_countrys[i].id = "00" + i;
        else
            jsonStruct_countrys[i].id = "0" + i;
    }
    console.log("updated IDs successfully!");
}
// write json file to disk
function updateJSONFile() {
    fs = require("fs");
    fs.writeFile("world_data.json", JSON.stringify(jsonStruct_countrys), function (err) {
        if (err) return console.log(err);
        console.log("successfully saved json!");
    });
}

//DELETE last item - API DELETE
app.delete('/delete', function(req, res) {
     if ( jsonStruct_countrys.length > 0 ) {
        var country = jsonStruct_countrys.pop();
        updateJSONFile();
    }
    res.send( "Deleted last country from list: " + country.name);
});

//DELETE item by id - API DELETE
app.delete('/delete/:id', function(req, res) {

    var msg = "";
    var deleted = false;
    for (var i=0; i < jsonStruct_countrys.length; i++) {
        if (jsonStruct_countrys[i].id == req.params.id) {
            jsonStruct_countrys.splice(i, 1);
            deleted = true;
            msg = "Item " + i + " deleted successfully!";
            reassignIDs();
            updateJSONFile();
        }
    }
    if (!deleted) {
        msg = "Cannot delete! No such ID in database.";
    }

    res.send( msg );
});

//POST (add) country - API POST
app.post('/addItem', function(req, res) {

    var new_country = {};
    new_country.name = req.body.name;
    new_country.birth_rate_per_1000 = req.body.birth_rate_per_1000;
    new_country.cell_phones_per_100 = req.body.cell_phones_per_100;
    jsonStruct_countrys.push(new_country);
    reassignIDs();
    updateJSONFile();
    return res.send("Added new country: " + new_country.name + " to list!");
});



// bind server to port
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
