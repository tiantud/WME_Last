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
// load content on page load
var properties;
var items;
$(document).ready(function() {

  load_properties(function(data){
    properties = data;
  });

  load_items(function(data){
    items = data;
  });

  set_options(properties);

  set_table("#table1");
  set_table("#table2");

  //item_filter(5);

  //delete items[1];

  alert(JSON.stringify(items));



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

//set options with recieved properties from API
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

/*
//keep selected data
function item_filter(property_id){
  load_items()(function(data){
    items = data;
  });
  for(var i=0; i < properties.length; i++){
    if(i != 1 && i != property_id){
      var prop = properties[i];
      for(var j=0; j < items.length; j++){
        delete items[i].prop;
      }
    }
  }
  for(var j=0; j < items.length; j++){
    delete items[i].["name"];
  }
}*/

/********************************************************
 ********************* D3js vis *************************
 ********************************************************/

function set_table(table_id){
  var svg = d3.select(table_id),
      margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.tsv("data.tsv", function(d) {
    d.frequency = +d.frequency;
    return d;
  }, function(error, data) {
    if (error) throw error;

    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

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
        .attr("x", function(d) { return x(d.letter); })
        .attr("y", function(d) { return y(d.frequency); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.frequency); });
  });
}

/********************************************************
 ********************* Leaflet **************************
 ********************************************************/

/* YOUR SCRIPTS */
