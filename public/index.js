// List.JS

var options = {
  valueNames: [
    "title",
    { name: "date", attr: "real-date" },
    "client",
    "description",
  ],
};

var archiveList = new List("archive", options);

// Prevent date repeat
var dateList = document.getElementsByClassName("date");
var previousDate = 0;

// Check if mobile
const mediaQuery = window.matchMedia("(max-width: 768px)");

// Add style to specific elements
for (let i = 0; i < archiveList.items.length; i++) {
  let currentDiv = dateList[i];
  var currentDate = currentDiv.getAttribute("real-date");
  if (currentDate == previousDate) {
    document.getElementsByClassName("date")[i].style.display = "none";
    if (mediaQuery.matches) {
      // If in mobile...
      document.getElementsByClassName("archive-item")[i].style.borderTop =
        "dotted rgba(0, 0, 0, 0.1)"; // ...add dotted lines between archive items
    }
  }
  previousDate = currentDate;
}
