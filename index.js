/*
HAMBURGER MENU 
*/
// Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon
function hamburger() {
    var x = document.getElementById("topnav");
    if (x.className === "navbar") {
        x.className += " responsive";
    } else {
        x.className = "navbar";
    }
}
// Toggles menu visibility when link is clicked
function disappear() {
    var x = document.getElementById("topnav");
    if (x.className != "navbar") {
        x.className = "navbar";
    }
}
