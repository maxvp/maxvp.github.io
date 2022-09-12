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

for (let i = 0; i < archiveList.items.length; i++) {
    let currentDiv = dateList[i];
    var currentDate = currentDiv.getAttribute("real-date");
    if (currentDate == previousDate) {
        document.getElementsByClassName("date")[i].style.display = "none";
    }
    previousDate = currentDate;
}
