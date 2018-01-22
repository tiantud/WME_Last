/********************************************************
 ********************* Collapsing Nav *******************
 ********************************************************/
var toggle_nav_btn = document.getElementById("pull");
toggle_nav_btn.onclick = function() {
  var main_nav = document.getElementById("main_nav");
  if ( main_nav.style.display == "" || main_nav.style.display == "none") {
    main_nav.style.display = "block";
  } else {
    main_nav.style.display = "none";
  }
}

//handle events from responsive show hide and collapsing nav
window.onresize = function(event) {
  var viewport_width = document.body.offsetWidth;

  //code of collapsing nav
  if (viewport_width >= 815) {
    main_nav.style.display = "block";
  } else if ( viewport_width < 815) {
    main_nav.style.display = "none";
  }
}

/********************************************************
 ********************* Sticky Header ********************
 ********************************************************/
var fixed = false;
var nav = document.getElementById("sticky_header");
var position = nav.offsetTop;

function stick(){
  var scrollY = window.scrollY || window.pageYOffset
  if (scrollY > position && !fixed) {
    fixed = true;
    nav.className = nav.className + ' fixed';
  } else if (scrollY <= position && fixed) {
    fixed = false;
    nav.classList.remove('fixed');
  }
}
window.onscroll = stick;

/********************************************************
 ********************* AJAX *****************************
 ********************************************************/
var properties;
var items;
var prop_index;
var mouseOverCountry;

// load content on page load
$(document).ready(function() {
  //load properties via API
  load_properties(function(data){
    properties = data;
  });

  //fulfill two select bar
  set_options(properties);

  //two tables will both show: country name -> ID
  prop_index = 0;
  refresh_table(prop_index, "#table1");
  refresh_table(prop_index, "#table2");
});

//when select bar is changed
$(".select_bar").change(function(){
  var table_ID = "";
  table_ID = $(this).find(":selected").parent().next().attr('id');
  prop_index = $(this).find(":selected").index();
  refresh_table(prop_index, "\#" + table_ID);
});


// get all properties
function load_properties(callback){
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/properties",
    dataType: "json",
    async: false,
    success: function(data){
      callback(data);
    },
    error: function(){
      alert('error');
    }
  });
}

// get all items
function load_items(callback){
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/items",
    dataType: "json",
    async: false,
    success: function(data){
      callback(data);
    },
    error: function(){
      alert('error');
    }
  });
}

//get position of all listed countries
function get_position(){
  var items;
  load_items(function(data){
    items = data;
  });
  for(var i=0; i<items.length; i++){
    for(var key=0; key<=properties.length; key++){
      //properties[1] = name
      //properties[12] = gps_lat
      //properties[13] = gps_long
      if(key!=1 && key!=12 && key!=13){
        delete items[i][properties[key]];
      }
    }
  }
  return items;
}

//get country_id from name
function get_id_from_name(name){
  var items;
  load_items(function(data){
    items = data;
  });
  for(var i=0; i<items.length;i++){
    if(items[i].name == name){
      return i;
    }
  }
}

//fulfill options with recieved properties from API
function set_options(properties){
  $.each(properties, function(key, value){
    $('#sel_table_1')
     .append($("<option></option>")
     .attr("value", key)
     .text(value));
     $('#sel_table_2')
      .append($("<option></option>")
      .attr("value", key)
      .text(value));
  });
}

//keep name and selected data
function item_filter(property_id, items){
  for(var i=0; i<items.length; i++){
    for(var key=0; key<=properties.length; key++){
      if(key!=property_id && key!=1){
        delete items[i][properties[key]];
      }
    }
  }
  return items;
}

//Pack up the relativ functions
function refresh_table(prop_index, table_id){
  //reload items
  var items;
  load_items(function(data){
    items = data;
  });

  //delete unselected data
  var filter_result = item_filter(prop_index, items);
  var selected_property = properties[prop_index];

  //refresh the D3 table
  set_table(table_id, filter_result, selected_property);

  //refresh map
  refreshMap(filter_result, selected_property);
}

/********************************************************
 ********************* D3js vis *************************
 ********************************************************/

//This is the example code from D3
function set_table(table_id, data, selected_property){
  var svg = d3.select(table_id),
      margin = {top: 20, right: 20, bottom: 150, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

  var str = table_id +" > *";
  d3.selectAll(str).remove();

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map(function(d) { return d["name"]; }));
  y.domain([0, d3.max(data, function(d) { return d[selected_property]; })]);

  g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

  g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "%"))
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Frequency");

  g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d["name"]); })
        .attr("countryName", function(d) { return d["name"]; })
        .attr("y", function(d) { return y(d[selected_property]); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d[selected_property]); })
        .on('mouseover', handleMouseOverFromD3)
        .on('mouseout', handleMouseOutFromD3);
  }

  //change color when mouse is over a bar
  function handleMouseOverFromD3(){
    var countryName = d3.select(this).attr("countryName");
    handleMouseOver(countryName);
    marker_list[get_id_from_name(countryName)].setIcon(blueIcon);
  }
  //use independent variable, so leaflet can also access to it
  function handleMouseOver(countryName){
    d3.selectAll(".bar").each(function(d){
      if(d3.select(this).attr("countryName") == countryName){
        mouseOverCountry = countryName;
        d3.select(this).style('fill', 'steelblue');
      }
    });
  }

  //change color back when mouse leave the area
  function handleMouseOutFromD3(){
    var countryName = d3.select(this).attr("countryName");
    handleMouseOut(countryName)
    marker_list[get_id_from_name(countryName)].setIcon(greyIcon);
  }
  //use independent variable, so leaflet can also access to it
  function handleMouseOut(countryName){
    d3.selectAll(".bar").each(function(d){
      if(d3.select(this).attr("countryName") == countryName){
        mouseOverCountry = null;
        d3.select(this).style('fill', 'gray');
      }
    });
  }


/********************************************************
 ********************* Leaflet **************************
 ********************************************************/
//init map
var mymap = L.map('mapid').setView([51.505, -0.09], 2);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(mymap);

var markerGroup = L.layerGroup().addTo(mymap);

var popup = L.popup();

function onMapClick(e) {
	popup
		.setLatLng(e.latlng)
		.setContent("You clicked the map at " + e.latlng.toString())
		.openOn(mymap);
}

var greyIcon = new L.Icon({
	iconUrl: 'leaflet/images/marker-icon-grey.png',
	shadowUrl: 'leaflet/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var blueIcon = new L.Icon({
	iconUrl: 'leaflet/images//marker-icon-blue.png',
	shadowUrl: 'leaflet/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

mymap.on('click', onMapClick);

var marker_list = new Array();

function refreshMap(filter_result, selected_property){
  markerGroup.clearLayers();

  var allPositions = get_position();

  //set all marker with Popup
  var lat, long;
  for(var i=0; i<allPositions.length; i++){
  lat = allPositions[i].gps_lat;
  long = allPositions[i].gps_long;
  marker_list[i] = L.marker([lat, long], {icon: greyIcon, countryName: allPositions[i].name}).addTo(markerGroup)
		.bindPopup("<b>" + selected_property + "</b><br />" +
               "<b>from:" + allPositions[i].name + "</b>" +
               "<br /><br />" +
               "<b>" + filter_result[i][selected_property] + "</b>")
    .on('mouseover', function(){
      this.setIcon(blueIcon);
      handleMouseOver(this.options.countryName);
    })
    .on('mouseout', function(){
      this.setIcon(greyIcon);
      handleMouseOut(this.options.countryName);
    });
  }
}
