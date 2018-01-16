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
$(document).ready(function() {
  alert("Your script!");
});

/********************************************************
 ********************* D3js vis *************************
 ********************************************************/

/* YOUR SCRIPTS */

/********************************************************
 ********************* Leaflet **************************
 ********************************************************/

/* YOUR SCRIPTS */
