//link to the data

//sorry for the inelegant code (but it works)

// var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'
var url = './data/minimal_120522.csv' //local backup


// this is not used
// var itemsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpZlBfSa0sBkPXXCdHykUFi5N2zPcclrda8iaYlbWoyzaWxDj7q3WEtmP7m8hrzk5ejAgjk-Id_zk9/pub?gid=1626158426&single=true&output=csv'

var urlHighlights = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3XiwLUS9uF0SIvV0QOOTGJv5FY077vEEIiShwtJkEcxDC-Dghp9JEycZxNDAplPetp73-ssUqZ8dv/pub?gid=0&single=true&output=csv'
// var urlHighlights = './data/highlights.csv'

// const width = 1500 //width of the svg sidebar is 350px - needs to be adjusted to allow for the width of the sidebar
const width = innerWidth - 420 //width of the svg sidebar is 350px - needs to be adjusted to allow for the width of the sidebar
const height = 22000
const margin = {
    top: 100,
    bottom: 100,
    left: 0,
    right: 100
  };

  // let detailview = false;
let soundtoggle = false;
// let uncertaintytoggle = false;

///audio
// const audio1 = new Audio("sounds/sound1.mp3")
// const audio2 = new Audio("sounds/sound2.mp3")
// const audio3 = new Audio("sounds/sound3.mp3")
// const audio4 = new Audio("sounds/sound4.mp3")
// const audio5 = new Audio("sounds/sound5.mp3")


function playAudio(file) {
  file.play();
}

var parseDate = d3.timeParse("%Y-%m-%d"); // further format to correctly position dates ()
var formatTime = d3.timeFormat("%e %B %Y"); //
var startParse = d3.timeParse("%Y-%m-%d %I:%M%p");
var endParse = d3.timeParse("%Y-%m-%d %I:%M%p");

let color =  d3.scaleOrdinal(d3.schemeCategory10)

///load data and preprocessing
Promise.all([
    d3.csv(url), //data
  ])
  .then(([keywordsData]) => {
    console.log(keywordsData)

    keywordsData = keywordsData.filter(function(d){return d.start < '1948-12-31' && d.end < '1948-12-31' })

//preprocessing

keywordsData.forEach(function(d,i){

    keywordsData[i]["vstart"] = keywordsData[i]["start"];
    keywordsData[i]["vend"] = keywordsData[i]["end"];
    keywordsData[i]["uncertaintystart"] = 0;
    keywordsData[i]["uncertaintyend"] = 0;
    keywordsData[i]["category1"] = false;
    keywordsData[i]["category2"] = false;
    keywordsData[i]["category3"] = false;
    keywordsData[i]["category4"] = false;
    keywordsData[i]["category5"] = false;

    keywordsData[i]["peopleSplit"] = keywordsData[i]["people"].split(";")
    keywordsData[i]["placesSplit"] = keywordsData[i]["places"].split(";")
    keywordsData[i]["artisticSplit"] = keywordsData[i]["artistic"].split(";")
    keywordsData[i]["worksSplit"] = keywordsData[i]["works"].split(";")
    keywordsData[i]["additionalSplit"] = keywordsData[i]["additional"].split(";")

})

for (let i = 0; i < keywordsData.length; i++) {

    var startA = keywordsData[i]["start"].split("-");

    if (startA[1] && startA[2] === "00" && keywordsData[i]["end"] === "") keywordsData[i]["end"] = keywordsData[i]["start"];

    var endA = keywordsData[i]["end"].split("-");
    // if (startA[1] && startA[2] == "00" && keywordsData[i]["end"] == "") keywordsData[i]["end"] = +startA[0] + 1 + "-01-01"; //duplicates where 'start' has a "-00-"" value to 'end' to create ranges

    /* 2. add 'uncertainty' levels:
    0: no uncertainty, e.g. 1898-01-23
    1: uncertainty in days, e.g. 1914-07-00
    2: uncertainty in months e.g. 1906-00-00
    */
    if (startA[1] == "00") keywordsData[i]["uncertaintystart"] = 2;
    else if (startA[2] == "00") keywordsData[i]["uncertaintystart"] = 1;
    if (endA[1] == "00") keywordsData[i]["uncertaintyend"] = 2;
    else if (endA[2] == "00") keywordsData[i]["uncertaintyend"] = 1;

    /* 3. populate vstart and vend. assign proper dates to events that automatically fall on 1st January
        start
          uncertainty == 2 → YYYY-01-01
          uncertainty == 1 → YYYY-MM-01
        end
          uncertainty == 2 → YYYY-12-31
          uncertainty == 1 → YYYY-MM-28
        */

    // gives all uncertain events actual dates values rather than placing it on 1st January

    if (keywordsData[i]["uncertaintystart"] == 2) {
      keywordsData[i]["vstart"] = startA[0] + "-01-01";
    } else if (keywordsData[i]["uncertaintystart"] == 1) {
      keywordsData[i]["vstart"] = startA[0] + "-" + startA[1] + "-01";
      keywordsData[i]["vend"] = startA[0] + "-" + startA[1] + "-28";
    } else keywordsData[i]["vstart"] = keywordsData[i]["start"];

    if (keywordsData[i]["uncertaintyend"] == 2) {
      keywordsData[i]["vend"] = +endA[0] + "-12-31";
      // else if (keywordsData[i]["uncertaintyend"] == 2) keywordsData[i]["vend"] = +endA[0] + 1 + "-01-01";
    }
    else if (keywordsData[i]["uncertaintyend"] == 1) {
      keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";
    } else keywordsData[i]["vend"] = keywordsData[i]["end"];

  // fix date ranges - 01, 03, 05, 07, 08, 10, 12 = 31
  // fix date ranges - 04, 06, 09, 11 = 30
  // else 28 (except leap years)

  if ((keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "01") ||
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "03") ||
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "05") ||
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "07") ||
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "08") ||
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "10") ||
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "12"))  {
 keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-31";
} else if ((keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "04") ||
          (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "06") ||
          (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "09") ||
          (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "11")) {
 keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-30";
} else if (keywordsData[i]["uncertaintyend"] == 1 && endA[1] =="02" && endA[0] % 4 === 0) {
 keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-29";
}
//  else keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";

if (keywordsData[i]["uncertaintyend"] == 2) keywordsData[i]["vend"] = endA[0] + "-12-31"; // it is currently also doing this "-undefined-28"
};

for (let i = 0; i < keywordsData.length; i++) {

  // category 1=Cinema and Theatre, category 2=Biography and Personality, category 3=Writing and Teaching, category 4=Graphic Art, category 5=Apartment
  //categories sorted into separate categories to aid with styling later

  if (keywordsData[i]["category"].includes("Cinema and Theatre")) keywordsData[i]["category1"] = true;
  if (keywordsData[i]["category"].includes("Biography and Personality")) keywordsData[i]["category2"] = true;
  if (keywordsData[i]["category"].includes("Writing and Teaching")) keywordsData[i]["category3"] = true;
  if (keywordsData[i]["category"].includes("Graphic Art")) keywordsData[i]["category1"] = true;
  if (keywordsData[i]["category"].includes("Apartment")) keywordsData[i]["category2"] = true;

};

keywordsData.forEach(function(d) {
//     d.vstart = +parseDate(d.vstart);
//     d.vend = +parseDate(d.vend);
d.vdateStart = +startParse(d.vstart  + " 00:01AM");
d.vdateEnd = +endParse(d.vend + " 23:59AM")
  });


//arrays for keyword categories

//array of keywords for places and the dates from vstart

    var placesStep1 = [];

    keywordsData.forEach(function(d,i){

        var keywords = d.places.split(";");
        keywords.forEach(function(D,i){
            if (D != "") {

                var keyword = {};
                keyword["keyword"] = D;  //keyword
                keyword["date"] = d.vstart; //date of appearances

                placesStep1.push(keyword);
            }
        });
    });

  //  console.log(placesStep1);

    //remove repeated keywords

    var placesStep2 = [];

    for (let i = 0; i < placesStep1.length; i++) {
        if (placesStep2.indexOf(placesStep1[i]["keyword"]) == -1) {
            placesStep2.push(placesStep1[i]["keyword"]);
        }
    }

  //  console.log(placesStep2);

    //create array of dates for each keyword

    //creat li

    var placesStep3 = [];

    for (let i = 0; i < placesStep2.length; i++) {

        var keyword = {};
        keyword["keyword"] = placesStep2[i];
        keyword["dates"] = [];

        for (let j = 0; j < placesStep1.length; j++) {
            if (placesStep1[j]["keyword"] == placesStep2[i]) {
                keyword["dates"].push(placesStep1[j]["date"]);
            }
        }

        placesStep3.push(keyword);

    }

    //console.log(placesStep3);

//create list of dates for keywords separated by ';' not as an array

    var placesStep4 = [];

    for (let i = 0; i < placesStep3.length; i++) {

        var keyword = {};
        keyword["keyword"] = placesStep3[i]["keyword"];
        keyword["dates"] = "";

        for (let j = 0; j < placesStep3[i]["dates"].length; j++) {
            if (j == 0) {
                keyword["dates"] = placesStep3[i]["dates"][j];
            } else {
                keyword["dates"] = keyword["dates"] + "; " + placesStep3[i]["dates"][j];
            }
        }

        placesStep4.push(keyword);

    }

    //console.log(placesStep4);

    //keep first date of each keyword and remove the rest

    var placesStep5 = [];

    for (let i = 0; i < placesStep4.length; i++) {

        var keyword = {};
        keyword["keyword"] = placesStep4[i]["keyword"];
        keyword["date"] = placesStep4[i]["dates"].split(";")[0];

        placesStep5.push(keyword);

    }

    //console.log(placesStep5);

// add column headers for places array

    var keywordsPlace = [];

    for (let i = 0; i < placesStep5.length; i++) {

      keywordsPlace[i] = {};
      keywordsPlace[i]["keyword"] = placesStep5[i]["keyword"];
      keywordsPlace[i]["category"] = "Places";
      keywordsPlace[i]["count"] = 0;
      keywordsPlace[i]["date"] = placesStep5[i]["date"];
    };

    keywordsData.forEach(function(d,i){
      var keywords = d.places.split(";");
      keywords.forEach(function(d,i){
          for (let j = 0; j < keywordsPlace.length; j++) {
            if (keywordsPlace[j]["keyword"] == d) {
              keywordsPlace[j]["count"] += 1;
            }
          }
      }
      );
    }
    );

   //console.log(keywordsPlace);

//array for people

    var peopleStep1 = [];

    keywordsData.forEach(function(d,i){

        var keywords = d.people.split(";");
        keywords.forEach(function(D,i){
            if (D != "") {

                var keyword = {};
                keyword["keyword"] = D;  //keyword
                keyword["date"] = d.vstart; //date of appearances

                peopleStep1.push(keyword);
            }
        });
    });

    //console.log(peopleStep1);

    //remove repeated keywords

    var peopleStep2 = [];

    for (let i = 0; i < peopleStep1.length; i++) {
        if (peopleStep2.indexOf(peopleStep1[i]["keyword"]) == -1) {
          peopleStep2.push(peopleStep1[i]["keyword"]);
        }
    }

    //console.log(peopleStep2);

    //create array of dates for each keyword

    var peopleStep3 = [];

    for (let i = 0; i < peopleStep2.length; i++) {

        var keyword = {};
        keyword["keyword"] = peopleStep2[i];
        keyword["dates"] = [];

        for (let j = 0; j < peopleStep1.length; j++) {
            if (peopleStep1[j]["keyword"] == peopleStep2[i]) {
                keyword["dates"].push(peopleStep1[j]["date"]);
            }
        }

        peopleStep3.push(keyword);

    }

    //console.log(peopleStep3);

    //create list of dates for keywords separated by ';' not as an array

    var peopleStep4 = [];

    for (let i = 0; i < peopleStep3.length; i++) {

        var keyword = {};
        keyword["keyword"] = peopleStep3[i]["keyword"];
        keyword["dates"] = "";

        for (let j = 0; j < peopleStep3[i]["dates"].length; j++) {
            if (j == 0) {
                keyword["dates"] = peopleStep3[i]["dates"][j];
            } else {
                keyword["dates"] = keyword["dates"] + "; " + peopleStep3[i]["dates"][j];
            }
        }

        peopleStep4.push(keyword);

    }

    //console.log(peopleStep4);

    //keep first date of each keyword and remove the rest

    var peopleStep5 = [];

    for (let i = 0; i < peopleStep4.length; i++) {

        var keyword = {};
        keyword["keyword"] = peopleStep4[i]["keyword"];
        keyword["date"] = peopleStep4[i]["dates"].split(";")[0];

        peopleStep5.push(keyword);

    }

    //console.log(peopleStep5);

    var keywordsPeople = [];

    for (let i = 0; i < peopleStep5.length; i++) {

      keywordsPeople[i] = {};
      keywordsPeople[i]["keyword"] = peopleStep5[i]["keyword"];
      keywordsPeople[i]["category"] = "People";
      keywordsPeople[i]["count"] = 0;
      keywordsPeople[i]["date"] = peopleStep5[i]["date"];
    };

keywordsData.forEach(function(d,i){
  var keywords = d.people.split(";");
  keywords.forEach(function(d,i){
      for (let j = 0; j < keywordsPeople.length; j++) {
        if (keywordsPeople[j]["keyword"] == d) {
          keywordsPeople[j]["count"] += 1;
        }
      }
  }
  );
}
);

//console.log(keywordsPeople);

//array for works

    var worksStep1 = [];

    keywordsData.forEach(function(d,i){

        var keywords = d.works.split(";");
        keywords.forEach(function(D,i){
            if (D != "") {

                var keyword = {};
                keyword["keyword"] = D;  //keyword
                keyword["date"] = d.vstart; //date of appearances

                worksStep1.push(keyword);
            }
        });
    });

    //console.log(worksStep1);

    //remove repeated keywords

    var worksStep2 = [];

    for (let i = 0; i < worksStep1.length; i++) {

        if (worksStep2.indexOf(worksStep1[i]["keyword"]) == -1) {
          worksStep2.push(worksStep1[i]["keyword"]);
        }
    }

    // //console.log(worksStep2);

    //create array of dates for each keyword

    var worksStep3 = [];

    for (let i = 0; i < worksStep2.length; i++) {

        var keyword = {};
        keyword["keyword"] = worksStep2[i];
        keyword["dates"] = [];

        for (let j = 0; j < worksStep1.length; j++) {
            if (worksStep1[j]["keyword"] == worksStep2[i]) {
                keyword["dates"].push(worksStep1[j]["date"]);
            }
        }

        worksStep3.push(keyword);

    }

    // //console.log(worksStep3);

    //create list of dates for keywords separated by ';' not as an array

    var worksStep4 = [];

    for (let i = 0; i < worksStep3.length; i++) {

        var keyword = {};
        keyword["keyword"] = worksStep3[i]["keyword"];
        keyword["dates"] = "";

        for (let j = 0; j < worksStep3[i]["dates"].length; j++) {
            if (j == 0) {
                keyword["dates"] = worksStep3[i]["dates"][j];
            } else {
                keyword["dates"] = keyword["dates"] + "; " + worksStep3[i]["dates"][j];
            }
        }

        worksStep4.push(keyword);

    }

    //console.log(worksStep4);

    //keep first date of each keyword and remove the rest

    var worksStep5 = [];

    for (let i = 0; i < worksStep4.length; i++) {

        var keyword = {};
        keyword["keyword"] = worksStep4[i]["keyword"];
        keyword["date"] = worksStep4[i]["dates"].split(";")[0];

        worksStep5.push(keyword);

    }

    //console.log(worksStep5);

    var keywordsWorks = [];

    for (let i = 0; i < worksStep5.length; i++) {

      keywordsWorks[i] = {};
      keywordsWorks[i]["keyword"] = worksStep5[i]["keyword"];
      keywordsWorks[i]["category"] = "Works";
      keywordsWorks[i]["count"] = 0;
      keywordsWorks[i]["date"] = worksStep5[i]["date"];
    };

    keywordsData.forEach(function(d,i){
      var keywords = d.works.split(";");
      keywords.forEach(function(d,i){
          for (let j = 0; j < keywordsWorks.length; j++) {
            if (keywordsWorks[j]["keyword"] == d) {
              keywordsWorks[j]["count"] += 1;
            }
          }
      }
      );
    }
    );

    //console.log(keywordsWorks);

    //array for artistic

    var artisticStep1 = [];

    keywordsData.forEach(function(d,i){

        var keywords = d.artistic.split(";");
        keywords.forEach(function(D,i){
            if (D != "") {

                var keyword = {};
                keyword["keyword"] = D;  //keyword
                keyword["date"] = d.vstart; //date of appearances

                artisticStep1.push(keyword);
            }
        });

    });

    //console.log(artisticStep1);

    //remove repeated keywords

    var artisticStep2 = [];

    for (let i = 0; i < artisticStep1.length; i++) {

        if (artisticStep2.indexOf(artisticStep1[i]["keyword"]) == -1) {
          artisticStep2.push(artisticStep1[i]["keyword"]);
        }
    }

    //console.log(artisticStep2);

    //create array of dates for each keyword

    var artisticStep3 = [];

    for (let i = 0; i < artisticStep2.length; i++) {

        var keyword = {};
        keyword["keyword"] = artisticStep2[i];
        keyword["dates"] = [];

        for (let j = 0; j < artisticStep1.length; j++) {
            if (artisticStep1[j]["keyword"] == artisticStep2[i]) {
                keyword["dates"].push(artisticStep1[j]["date"]);

            }

        }

        artisticStep3.push(keyword);

    }

    //console.log(artisticStep3);

    //create list of dates for keywords separated by ';' not as an array

    var artisticStep4 = [];

    for (let i = 0; i < artisticStep3.length; i++) {

        var keyword = {};
        keyword["keyword"] = artisticStep3[i]["keyword"];
        keyword["dates"] = "";

        for (let j = 0; j < artisticStep3[i]["dates"].length; j++) {
            if (j == 0) {
                keyword["dates"] = artisticStep3[i]["dates"][j];
            } else {

                keyword["dates"] = keyword["dates"] + "; " + artisticStep3[i]["dates"][j];
            }
        }

        artisticStep4.push(keyword);

    }

    //console.log(artisticStep4);

    //keep first date of each keyword and remove the rest

    var artisticStep5 = [];

    for (let i = 0; i < artisticStep4.length; i++) {

        var keyword = {};
        keyword["keyword"] = artisticStep4[i]["keyword"];
        keyword["date"] = artisticStep4[i]["dates"].split(";")[0];

        artisticStep5.push(keyword);

    }

    //console.log(artisticStep5);

    var keywordsArtistic = [];

    for (let i = 0; i < artisticStep5.length; i++) {

      keywordsArtistic[i] = {};
      keywordsArtistic[i]["keyword"] = artisticStep5[i]["keyword"];
      keywordsArtistic[i]["category"] = "Artistic";
      keywordsArtistic[i]["count"] = 0;
      keywordsArtistic[i]["date"] = artisticStep5[i]["date"];
    };

    keywordsData.forEach(function(d,i){
      var keywords = d.artistic.split(";");
      keywords.forEach(function(d,i){
          for (let j = 0; j < keywordsArtistic.length; j++) {
            if (keywordsArtistic[j]["keyword"] == d) {
              keywordsArtistic[j]["count"] += 1;
            }
          }
      }
      );
    }

    );

    //console.log(keywordsArtistic);

    //array for additional

    var additionalStep1 = [];

    keywordsData.forEach(function(d,i){

        var keywords = d.additional.split(";");
        keywords.forEach(function(D,i){
            if (D != "") {

                var keyword = {};
                keyword["keyword"] = D;  //keyword
                keyword["date"] = d.vstart; //date of appearances

                additionalStep1.push(keyword);
            }
        });

    });

    //console.log(additionalStep1);
    // console.log(additionalStep1);

    //remove repeated keywords

    var additionalStep2 = [];

    for (let i = 0; i < additionalStep1.length; i++) {

        if (additionalStep2.indexOf(additionalStep1[i]["keyword"]) == -1) {
          additionalStep2.push(additionalStep1[i]["keyword"]);
        }
    }

    //console.log(additionalStep2);

    //create array of dates for each keyword

    var additionalStep3 = [];

    for (let i = 0; i < additionalStep2.length; i++) {

        var keyword = {};
        keyword["keyword"] = additionalStep2[i];
        keyword["dates"] = [];

        for (let j = 0; j < additionalStep1.length; j++) {
            if (additionalStep1[j]["keyword"] == additionalStep2[i]) {
                keyword["dates"].push(additionalStep1[j]["date"]);

            }

        }

        additionalStep3.push(keyword);

    }

    //console.log(additionalStep3);

    //create list of dates for keywords separated by ';' not as an array

    var additionalStep4 = [];

    for (let i = 0; i < additionalStep3.length; i++) {

        var keyword = {};
        keyword["keyword"] = additionalStep3[i]["keyword"];
        keyword["dates"] = "";

        for (let j = 0; j < additionalStep3[i]["dates"].length; j++) {
            if (j == 0) {
                keyword["dates"] = additionalStep3[i]["dates"][j];
            } else {
                keyword["dates"] = keyword["dates"] + "; " + additionalStep3[i]["dates"][j];
            }
        }

        additionalStep4.push(keyword);

    }

    //console.log(additionalStep4);

    //keep first date of each keyword and remove the rest

    var additionalStep5 = [];

    for (let i = 0; i < additionalStep4.length; i++) {

        var keyword = {};

        keyword["keyword"] = additionalStep4[i]["keyword"];
        keyword["date"] = additionalStep4[i]["dates"].split(";")[0];

        additionalStep5.push(keyword);

    }

    //console.log(additionalStep5);

    var keywordsAdditional = [];

    for (let i = 0; i < additionalStep5.length; i++) {

      keywordsAdditional[i] = {};
      keywordsAdditional[i]["keyword"] = additionalStep5[i]["keyword"];
      keywordsAdditional[i]["category"] = "Additional";
      keywordsAdditional[i]["count"] = 0;
      keywordsAdditional[i]["date"] = additionalStep5[i]["date"];
    };

    keywordsData.forEach(function(d,i){
      var keywords = d.additional.split(";");
      keywords.forEach(function(d,i){
          for (let j = 0; j < keywordsAdditional.length; j++) {
            if (keywordsAdditional[j]["keyword"] == d) {
              keywordsAdditional[j]["count"] += 1;
            }
          }
      }
      );
    }

    );

    //console.log(keywordsAdditional);

    //combine keywordsPeople, keywordsPlaces, keywordsWorks, keywordsArtistic, and keywordsAdditional into one array

    var keywordsAll = keywordsPeople.concat(keywordsPlace, keywordsWorks, keywordsArtistic, keywordsAdditional);

console.log(keywordsAll);

    var keywordsAllSorted = keywordsAll.sort(function(a,b){

        return b.count - a.count;

    }

    );

    //console.log(keywordsAllSorted);



//spiritual family data

    // Promise.all([
    //   d3.csv(itemsUrl), //data
    // ])
    //   .then(([itemsData]) => {
    //     console.log(itemsData);
    //   });

      for (let i = 0; i < keywordsData.length; i++) {

      if (keywordsData[i]["items"]) {
        keywordsData[i]["items"] = keywordsData[i]["items"].split(",");
      }
    };

//scale for width of timeline

    var dateStart = d3.min(keywordsData, function(d) { return d.vstart; });
    var dateEnd = d3.max(keywordsData, function(d) { return d.vend; });

    var dateRange = d3.timeYear.range(dateStart, dateEnd);

    var dateRangeLength = dateRange.length;

    // console.log(dateRangeLength); //number of years

    // append svg to chart

let keywordListLength = keywordsAll.length //total number of keywords
let timelineheight =  50+keywordsAll.length*20 //based in timelinsG code we calculate the size of the chart
//console.log(keywordListLength)
//console.log(timelineheight)

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", timelineheight +"px")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("g");

    // var yScale = d3.scaleLinear()
    // .domain([0, keywordsCountFiltered.length])  //number of distinct keywords
    // .range([0, height]);    //height of timeline

//

// highlights

Promise.all([
  d3.csv(urlHighlights), //data
])
  .then(([highlightsData]) => {

    // remove hard-coded elements
    document.querySelectorAll(".highlights p").forEach((el) => el.remove());

    //create a p class for each of the 'identifier's and insert into into the div class="highlights" in index.html
    for (let i = 0; i < highlightsData.length; i++) {
    let identifier = highlightsData[i]["identifier"];
    let text = highlightsData[i]["name"];
    let p = document.createElement("p");
    p.className = identifier;
    p.innerHTML = text;
    document.getElementsByClassName("highlights")[0].appendChild(p);
    }

      //console.log(highlightsData);


  const timelineXScale = d3.scaleTime()
    .domain([new Date("1897-01-01"), new Date("1949-01-01")])
    .range([350,width-200])

// console.log(new Date("1926-01-22"))
// console.log(timelineXScale(new Date(1926)))

// tooltip setup

var tooltip = d3.select("body")
.append('div')
.data(keywordsData)
.attr('class', 'tooltip')
.style('display', 'none');

var highlightbar = d3.select("#sidebar")
.append('div')
.attr('class', 'highlightbar');

var sidebar = d3.select("#sidebar")
.append('div')
.attr('class', 'sidebar');

//Conditioning the data for the sidebar

// Set of functions for html formatting in tooltip and sidebar

// htmlRenderer is a function in the form: (data) => htmlText
// eg. (title) => `<p class="title">${title}</p>`
// if data exists, it'll return the string with data inside it, otherwise it'll return an empty string
function conditionalReturn(data, htmlFormatter) {
  if (data == null || data === '' || data === false) {
    return '';
  }
  return htmlFormatter(data);
}

// function to compare content of strings and omit repeated strings

function compareDescription(d, descriptionFormat) {

let a = d.description

let b = d.title

  if (a === b) {
    return '';
}
 else {
   return descriptionFormat(d.description);
 }
};

// function to replace date with optional uncertain date

function replaceTemporal(d, temporalSwap) {

  let a = d.displayTemporal
  let b = d.vstart

  if (a == null || a === '' || a === false) {
    return temporalSwap(b)}
      else {
    }
  if (a !== null || a !== '' || a !== false) {
    return '';
  }};

//function to split keywords by comma

function stringSplit(data, keywordSplitter) {

 var kws = data.split(";")

 if (data == null || data === '' || data === false) {
      return '';
    } else {

      } if (kws.length > 1) { return keywordSplitter(kws.join(", ")) }

      else { return keywordSplitter(kws) }

  };

  // the timelines

  let timelinesG = d3.select("#chart")
                  .select("svg")
                  .selectAll(".timelines")
                  //sort data by date
                  .data(keywordsAll.sort(function(a, b) {
                    return d3.ascending(a.date, b.date);
                  }))
                  // .data(keywordsAll)
                  .join("g")
                  .classed("backgroundTimelineG", true)
  .classed("people", function (d) { if (keywordsPeople.filter(function(D){return D==d}).length>0){return true}else{return false}})
  .classed("places", function (d) { if (keywordsPlace.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("works", function (d) { if (keywordsWorks.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("artistic", function (d) { if (keywordsArtistic.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("additional", function (d) { if (keywordsAdditional.filter(function(D){return D==d}).length >0){return true}else{return false}})

  //append text from "keyword" to the timeline

  timelinesG.append("text")
  .text(function(d){
    if(d.keyword.length >= 20){return d.keyword.slice(0, 20) + "[…]"}
    else{return d.keyword}})
  .attr("x", 320)
  .attr("y", function(d,i){return 10+i*20+3})
  .attr("font-size", "12px")
  .attr("text-weight", 400)
  .style("text-anchor", "end")
  .style("fill", "black")
  .classed("keyword", true)
  .classed("people", function (d) { if (keywordsPeople.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("places", function (d) { if (keywordsPlace.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("works", function (d) { if (keywordsWorks.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("artistic", function (d) { if (keywordsArtistic.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("additional", function (d) { if (keywordsAdditional.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("category", true)
  .classed("cinema", function(d){
    if(keywordsData.filter(function(D){return (D.placesSplit.filter(function(place){return d.keyword==place})).length>0
      || (D.peopleSplit.filter(function(people){return d.keyword==people})).length>0
      || (D.worksSplit.filter(function(works){return d.keyword==works})).length>0
      || (D.artisticSplit.filter(function(artistic){return d.keyword==artistic})).length>0
      || (D.additionalSplit.filter(function(additional){return d.keyword==additional})).length>0}).filter(function(event){return event.category.includes("Cinema") == true || event.category.includes("Graphic") == true}).length >0)
    {return true}else{return false}
  })
  .classed("biography", function(d){
    if(keywordsData.filter(function(D){return (D.placesSplit.filter(function(place){return d.keyword==place})).length>0
      || (D.peopleSplit.filter(function(people){return d.keyword==people})).length>0
      || (D.worksSplit.filter(function(works){return d.keyword==works})).length>0
      || (D.artisticSplit.filter(function(artistic){return d.keyword==artistic})).length>0
      || (D.additionalSplit.filter(function(additional){return d.keyword==additional})).length>0}).filter(function(event){return event.category.includes("Biography") == true || event.category.includes("Apartment") == true}).length >0)
    {return true}else{return false}
  })
  .classed("writing", function(d){
    if(keywordsData.filter(function(D){return (D.placesSplit.filter(function(place){return d.keyword==place})).length>0
      || (D.peopleSplit.filter(function(people){return d.keyword==people})).length>0
      || (D.worksSplit.filter(function(works){return d.keyword==works})).length>0
      || (D.artisticSplit.filter(function(artistic){return d.keyword==artistic})).length>0
      || (D.additionalSplit.filter(function(additional){return d.keyword==additional})).length>0}).filter(function(event){return event.category.includes("Writing") == true}).length >0)
    {return true}else{return false}
  })




  timelinesG.append("line")
  .attr("x1", 350)  //start of timeline
  .attr("y1", function(d,i){return 10+i*20})
  .attr("x2", width-200)  //end of timeline
  .attr("y2", function(d,i){return 10+i*20})
  // .attr("stroke", "white")
  // .attr("stroke-width", 3)
  .style("stroke", "grey")
  .style("stroke", ("6, 5"))
  .style("opacity", 0.05)
  .classed("timeline", true)

  //append an axis for the dates of the timeline

//   var dateScale = d3.scaleLinear()
//   .domain([new Date("1897-01-01"), new Date("1975-01-01")])
//   .range([350,width-200])

// //append a line to 'yearlabel' div below div with the class "sorting"

// var svgDate = d3.select("#yearlabel")
// .append("svg")
// .attr("width", dateScale(new Date("1897-01-01")))
// .attr("height", 150)
// .append("g")
// //append a line to 'yearlabel' div below div with the class "sorting"

//   svgDate.append("line")
//   .attr("x1", dateScale(new Date("1897-01-01")))  //start of timeline
//   .attr("y1", 25)
//   .attr("x2", dateScale(new Date("1897-01-01")))  //end of timeline
//   .attr("y2", 25)
//   .attr("stroke", "grey")
//   .attr("stroke-width", 3)
//   .style("opacity", 0.05)



  // d3.select("#yearlabel")
  // .append("line")
  // .attr("x1", dateScale(new Date("1897-01-01")))
  // .attr("y1", 20)
  // .attr("x2", dateScale(new Date("1975-01-01")))
  // .attr("y2", 20)
  // .attr("stroke", "black")
  // .attr("stroke-width", 1)






// circles for timeline

  timelinesG.each(function(D,I){
    d3.select(this).selectAll(".timelineNodes").append("g")
    .data(keywordsData.filter(function (d) {
      if(d.uncertaintystart === 0 && d.vend === ""){
        return ((d.placesSplit.filter(function(place){return D.keyword==place}).length >0) || (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) || (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) || (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) || (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0))
         && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
    }}))
    .join("circle")
    .classed("circles", true)
    .attr("r",3)
    .attr("cx", function(d,i){
      let date = new Date (d.vstart)
    //console.log(date + "-" + timelineXScale(date))
      return timelineXScale(date)})
    .attr("cy", function(){return 10+I*20})
    .classed("cinema", function (d) {
      if (d.category1 == true && d.category2 == false && d.category3 == false) {
        return true;

      } return false;
    })
    .classed("biography", function (d) {
      if (d.category2 == true && d.category1 == false && d.category3 == false) {
        return true;
      } return false;
    })
    .classed("writing", function (d) {
      if (d.category3 == true && d.category1 == false && d.category2 == false) {
        return true;
      } return false;
    })
    .classed("cinebio", function (d) {
      if (d.category1 == true && d.category2 == true && d.category3 == false) {
        return true;
      } return false;
    })
    .classed("biowrit", function (d) {
      if (d.category1 == false && d.category2 == true && d.category3 == true) {
        return true;
      } return false;
    })
    .classed("cinewrit", function (d) {
      if (d.category1 == true && d.category2 == false && d.category3 == true) {
        return true;
      } return false;
    })
    .classed("allcat", function (d) {
      if (d.category1 == true && d.category2 == true && d.category3 == true) {
        return true;
      } return false;
    })
    .classed("people", function (d) {
      if (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) {
        return true;
        }else{ return false};
        })
    .classed("places", function (d) {
      if (d.placesSplit.filter(function(place){return D.keyword==place}).length >0) {
        return true;
        }else{ return false};
        })
    .classed("works", function (d) {
      if (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) {
        return true;
        }else{ return false};
        })
    .classed("artistic", function (d) {
      if (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) {
        return true;
        }else{ return false};
        })
    .classed("additional", function (d) {
      if (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0) {
        return true;
        }else{ return false};
        })

      //tooltip
    .on('mousemove', function (event, d) {
      tooltip
        .style('position', 'absolute')
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY + 10}px`)
        .style('display', 'inline-block')
        .style('opacity', '0.9')
        .html(`
        ${replaceTemporal(d, (vdateStart) => `<p class="tooltip-date">${formatTime(d.vdateStart)}</p>`)}
        ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="tooltip-displayTemporal"><b>${displayTemporal}</b></p>`)}
        <p class="tooltip-title">${d.title}</p>`);
    })

      .on('click', function (event, d) {

        d3.selectAll(".circles").classed("notSelected", true).classed("selected", false)
        d3.selectAll(".timelineLines").classed("notSelectedLine", true).classed("selectedLine", false)
        d3.select(this).classed("selected", true).classed("notSelected", false)

      d3.select("#closedsidebar").style("display", "block")
      sidebar
      .style('display', 'block')
      .html(`
            ${replaceTemporal(d, (vdateStart) => `<p class="date">${formatTime(d.vdateStart)}</p>`)}
            ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
            ${conditionalReturn(d.title, (title) => `<h2 class="title">${title}</h2>`)}
            ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
            ${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
            ${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
            ${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
            ${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
            ${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
            ${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
            ${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
            <br/>
            ${conditionalReturn(d.category1, (category1) => `<p><span class="key-dot cinema"></span>Cinema and Theatre<br></p>`)}
            ${conditionalReturn(d.category2, (category2) => `<p><span class="key-dot biography"></span>Biography and Personality<br></p>`)}
            ${conditionalReturn(d.category3, (category3) => `<p><span class="key-dot writing"></span>Writing and Teaching<br></p>`)}

            `)

  })
  .on('mouseout', function (d) {
    tooltip.style('display', 'none');
    tooltip.style('opacity', 0);

    d3.selectAll(".circles")
    .style("opacity", 1)
  })
  .on('mouseout', function (d) {
    tooltip.style('display', 'none');
    tooltip.style('opacity', 0);

    d3.selectAll(".circles")
    .style("opacity", 1)
  });
  d3.selectAll("#closedsidebar")
    .on('click', function (d, event) {
      event.stopPropagation()
      d3.select(".sidebar")
        .style("display", "none")

        d3.selectAll(".circles").classed("selected", false).classed("notSelected", false)
        d3.selectAll(".timelineLines").classed("selectedLine", false).classed("notSelectedLine", false)

      d3.select("#closedsidebar").style("display", "none")


    });
  })

  //spans

  timelinesG.each(function(D,I){
    d3.select(this).selectAll(".timelineLines").append("g")
    .data(keywordsData.filter(function (d) {
      if (d.vend.includes("-")) {
   return ((d.placesSplit.filter(function(place){return D.keyword==place}).length >0) || (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) || (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) || (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) || (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0)) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != ""//took out some data points that create errors for now
    } }))
    .join("line")
    .classed("timelineLines", true)
    .attr("stroke-width", 6)
    .classed("cinema", function (d) {
      if (d.category1 == true && d.category2 == false && d.category3 == false) {
        return true;

      } return false;
    })
    .classed("biography", function (d) {
      if (d.category2 == true && d.category1 == false && d.category3 == false) {
        return true;
      } return false;
    })
    .classed("writing", function (d) {
      if (d.category3 == true && d.category1 == false && d.category2 == false) {
        return true;
      } return false;
    })
    .classed("cinebio", function (d) {
      if (d.category1 == true && d.category2 == true && d.category3 == false) {
        return true;
      } return false;
    })
    .classed("biowrit", function (d) {
      if (d.category1 == false && d.category2 == true && d.category3 == true) {
        return true;
      } return false;
    })
    .classed("cinewrit", function (d) {
      if (d.category1 == true && d.category2 == false && d.category3 == true) {
        return true;
      } return false;
    })
    .classed("allcat", function (d) {
      if (d.category1 == true && d.category2 == true && d.category3 == true) {
        return true;
      } return false;
    })
    .classed("people", function (d) {
      if (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) {
        return true;
        }else{ return false};
        })
    .classed("places", function (d) {
      if (d.placesSplit.filter(function(place){return D.keyword==place}).length >0) {
        return true;
        }else{ return false};
        })
    .classed("works", function (d) {
      if (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) {
        return true;
        }else{ return false};
        })
    .classed("artistic", function (d) {
      if (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) {
        return true;
        }else{ return false};
        })
    .classed("additional", function (d) {
      if (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0) {
        return true;
        }else{ return false};
        })

                .attr("x1", function(d,i){
                  let date = new Date (d.vstart)
                // console.log(date + "-" + timelineXScale(date))
                  return timelineXScale(date)})
                .attr("y1", function(){return 10+I*20})
                .attr("x2", function(d,i){
                  let date = new Date (d.vend)
                // console.log(date + "-" + timelineXScale(date))
                // console.log(d.vend + "-" +date + "-" + timelineXScale(date))

                // if x2-x1 is less than 5, then it is a single point, so we want to make it a little bigger
                if (timelineXScale(date) - timelineXScale(date) < 5) {
                  return timelineXScale(date) + 5
                } else {
                  return timelineXScale(date)
                }
                })

                  // return timelineXScale(date)})
                .attr("y2", function(){return 10+I*20})
      .on('mousemove', function (event, d) {
        tooltip
          .style('position', 'absolute')
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY + 10}px`)
          .style('display', 'inline-block')
          .style('opacity', '0.9')
          .html(`
                ${replaceTemporal(d, (vdateStart) => `<p class="tooltip-date">${formatTime(d.vdateStart)} to ${formatTime(d.vdateEnd)}</p>`)}
                ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="tooltip-displayTemporal"><b>${displayTemporal}</b><p>`)}
                <p class="tooltip-title">${d.title}</p>`);
      })
      .on('click', function (event, d) {

        d3.selectAll(".timelineLines").classed("notSelectedLine", true).classed("selectedLine", false)
        d3.selectAll(".circles").classed("notSelected", true).classed("selected", false)
        d3.select(this).classed("selectedLine", true).classed("notSelectedLine", false)

        d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
        sidebar
          .style('display', 'block')
          .html(`
          ${replaceTemporal(d, (vdateStart) => `<b><p class="date">${formatTime(d.vdateStart)}</b> to <b>${formatTime(d.vdateEnd)}</b></p>`)}
          ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
          ${conditionalReturn(d.title, (title) => `<p class="title">${title}</p>`)}
          ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
          ${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
          ${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
          ${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
          ${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
          ${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
          ${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
          ${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
          <br/>
          ${conditionalReturn(d.category1, (category1) => `<span class="key-dot cinema"></span>Cinema and Theatre<br>`)}
          ${conditionalReturn(d.category2, (category2) => `<span class="key-dot biography"></span>Biography and Personality<br>`)}
          ${conditionalReturn(d.category3, (category3) => `<span class="key-dot writing"></span>Writing and Teaching<br>`)}
          `)

      })
      .on('mouseout', function (d) {
        tooltip.style('display', 'none');
        tooltip.style('opacity', 0);

        d3.selectAll(".timelineLines")
        .style("opacity", 1)
      })
      d3.selectAll("#closedsidebar")
      .on('click', function (event, d) {
        event.stopPropagation()
        d3.select(".sidebar")
          .style("display", "none")

          d3.selectAll(".timelineLines").classed("selectedLine", false).classed("notSelectedLine", false)
          d3.selectAll(".circles").classed("selected", false).classed("notSelected", false)


        d3.select("#closedsidebar").style("display", "none")

      })
        })

// symbols for keyword categories

  timelinesG.each(function(D,I){
  d3.select(this).selectAll(".symbols").append("g")
  .data(keywordsData.filter(function (d) {
        return (d.placesSplit.filter(function(place){return D.keyword==place}).length >0) || (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) || (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) || (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) || (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
              }))

.join("image")
.attr("transform", function(d,i){
return "translate(340," + (2+I*20) + ")"})
.attr("xlink:href", function(d){

        if( d.placesSplit.filter(function(place){return D.keyword==place}).length >0){
          return "images/entities_icons/diamond.svg"
        } else if( d.peopleSplit.filter(function(people){return D.keyword==people}).length >0){
          return "images/entities_icons/triangle.svg"
        } else if( d.worksSplit.filter(function(work){return D.keyword==work}).length >0){
          return "images/entities_icons/threeprong.svg"
        } else if( d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0){
          return "images/entities_icons/square.svg"
        } else if( d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0){
          return "images/entities_icons/plus.svg"
        }
         })
         .attr("width", 12+"px")
         .attr("height", 12+"px")
.attr("opacity", 1)

})

///////////////////search


let nodes = []
let links = []

keywordsData.forEach(function(d, i) {

  let peopleNodes = d.people == "" ? [] : d.people.split(";")
  let placesNodes = d.places == "" ? [] : d.places.split(";")
  let worksNodes = d.works == "" ? [] : d.works.split(";")
  let artisticNodes = d.artistic == "" ? [] : d.artistic.split(";")
  let additionalNodes = d.additional == "" ? [] : d.additional.split(";")

  //add people to nodes
  peopleNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "people"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })


  //add places to nodes
  placesNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "places"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })

  //add works to nodes
  worksNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "works"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })

  //add artistic to nodes
  artisticNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "artistic"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })

  //add additional to nodes
  additionalNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "additional"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })

  // NOT USED ↓
  // let allNodes = [].concat(peopleNodes, placesNodes, worksNodes, artisticNodes, additionalNodes)
  //
  // //create combinations of source+targets out of all "objects"
  // //https://stackoverflow.com/questions/43241174/javascript-generating-all-combinations-of-elements-in-a-single-array-in-pairs
  // allNodes.flatMap(
  //   function(v, i) {
  //     return allNodes.slice(i + 1).forEach(function(w) {
  //       //  console.log( v + '+ ' + w )
  //       if (links.filter(function(D) {
  //           return (D.source == v && D.target == w) || D.source == w && D.target == v
  //         }).length == 0) {
  //         links.push({
  //           source: v,
  //           target: w,
  //           children: [{
  //             source: v,
  //             target: w,
  //             category: d.category,
  //             dateStart: new Date(d.vstart),
  //             dateEnd: new Date(d.vend),
  //             relation_source: d.title,
  //             description: d.description
  //           }],
  //         })
  //       } else {
  //         links.filter(function(D) {
  //           return (D.source == v && D.target == w) || D.source == w && D.target == v
  //         })[0].children.push({
  //           source: v,
  //           target: w,
  //           category: d.category,
  //           dateStart: new Date(d.vstart),
  //           dateEnd: new Date(d.vend),
  //           relation_source: d.title,
  //           description: d.description
  //         })
  //
  //       }
  //
  //     })
  //   }
  // )



})



nodes.sort(function(a, b) {
  return b.count - a.count;
})

///////////////////search



let searchDaten = [{
    text: "People",
    children: []
  },
  {
    text: "Places",
    children: []
  },
  {
    text: "Concepts",
    children: []
  },
  {
    text: "Miscellaneous",
    children: []
  },
  {
    text: "Works",
    children: []
  },

];


nodes.filter(function(d) {
  return d.category == "people"
}).forEach(function(d, i) {
  searchDaten[0].children.push({
    id: i,
    text: d.name + " (" + d.count  + (d.count > 1 ? " events)": " event)"),
    name: d.name,
    category: "people",
    count: d.count,
  })
})

nodes.filter(function(d) {
  return d.category == "places"
}).forEach(function(d, i) {
  searchDaten[1].children.push({
    id: i,
    text: d.name + " (" + d.count + (d.count > 1 ? " events)": " event)"),
    name: d.name,
    category: "places",
    count: d.count,
  })
})

nodes.filter(function(d) {
  return d.category == "artistic"
}).forEach(function(d, i) {
  searchDaten[2].children.push({
    id: i,
    text: d.name + " (" + d.count + (d.count > 1 ? " events)": " event)"),
    name: d.name,
    category: "artistic",
    count: d.count,
  })
})

nodes.filter(function(d) {
  return d.category == "additional"
}).forEach(function(d, i) {
  searchDaten[3].children.push({
    id: i,
    text: d.name + " (" + d.count + (d.count > 1 ? " events)": " event)"),
    name: d.name,
    category: "additional",
    count: d.count,
  })
})

nodes.filter(function(d) {
  return d.category == "works"
}).forEach(function(d, i) {
  searchDaten[4].children.push({
    id: i,
    text: d.name + " (" + d.count  + (d.count > 1 ? " events)": " event)"),
    name: d.name,
    category: "works",
    count: d.count,
  })
})

////search
$("#search").select2({
data: searchDaten,
containerCssClass: "search",
selectOnClose: true,
placeholder: "Search",
allowClear: true

});


$("#search").on("select2-selecting", function(e) {
//console.log(e.choice.name)
//console.log(e.choice.category)

// d3.selectAll(".circles,.pathGs").classed("catFilteredOut", false)
// d3.selectAll(".circles,.pathGs").classed("selected", false).classed("notSelected", false)
d3.select("#closedsidebar").style("display", "none")
d3.select(".sidebar").style("display", "none")
d3.select(".highlightbar").style("display", "none")
d3.select("#closedhighlightbar").style("display", "none")
d3.selectAll(".filter").style("font-weight", 400)
d3.selectAll(".highlights p").style("font-weight", 400)
d3.selectAll(".entities p").style("font-weight", 400)
d3.selectAll("text").classed("notText", false)
d3.selectAll(".keyword").style("font-weight", 400)

d3.selectAll("circle").classed("notSelected", function(d){
  if (e.choice.category == "people"){
    if(d.people.includes(e.choice.name)){return false}else{return true}
  }else if (e.choice.category == "places"){
      if(d.places.includes(e.choice.name)){return false}else{return true}
    }else if (e.choice.category == "artistic"){
        if(d.artistic.includes(e.choice.name)){return false}else{return true}
      }else if (e.choice.category == "additional"){
          if(d.additional.includes(e.choice.name)){return false}else{return true}
        }else if (e.choice.category == "works"){
            if(d.works.includes(e.choice.name)){return false}else{return true}
          }})

          d3.selectAll(".timelineLines").classed("notselectedLine", function(d){
            if (e.choice.category == "people"){
              if(d.people.includes(e.choice.name)){return false}else{return true}
            }else if (e.choice.category == "places"){
                if(d.places.includes(e.choice.name)){return false}else{return true}
              }else if (e.choice.category == "artistic"){
                  if(d.artistic.includes(e.choice.name)){return false}else{return true}
                }else if (e.choice.category == "additional"){
                    if(d.additional.includes(e.choice.name)){return false}else{return true}
                  }else if (e.choice.category == "works"){
                      if(d.works.includes(e.choice.name)){return false}else{return true}
                    }})

                    d3.selectAll("text").classed("notText", function(d){
                      if (e.choice.category == "people"){
                        if(d.keyword.includes(e.choice.name)){return false}else{return true}
                      }else if (e.choice.category == "places"){
                          if(d.keyword.includes(e.choice.name)){return false}else{return true}
                        }else if (e.choice.category == "artistic"){
                            if(d.keyword.includes(e.choice.name)){return false}else{return true}
                          }else if (e.choice.category == "additional"){
                              if(d.keyword.includes(e.choice.name)){return false}else{return true}
                            }else if (e.choice.category == "works"){
                                if(d.keyword.includes(e.choice.name)){return false}else{return true}
                              }})

                              d3.selectAll("text").style("font-weight", function(d){
                                if (e.choice.category == "people"){
                                  if(d.keyword.includes(e.choice.name)){return "bold"}else{return 400}
                                }else if (e.choice.category == "places"){
                                    if(d.keyword.includes(e.choice.name)){return "bold"}else{return 400}
                                  }else if (e.choice.category == "artistic"){
                                      if(d.keyword.includes(e.choice.name)){return "bold"}else{return 400}
                                    }else if (e.choice.category == "additional"){
                                        if(d.keyword.includes(e.choice.name)){return "bold"}else{return 400}
                                      }else if (e.choice.category == "works"){
                                          if(d.keyword.includes(e.choice.name)){return "bold"}else{return 400}
                                        }})

//scroll to the "text" tht matches "e.choice.name"

let element = document.querySelector("text:not(.notText)");
//console.log(element)

element.scrollIntoView({
  behavior: 'auto',
  block: 'center',
  inline: 'center'
})

})


$("#search").on("select2-clearing", function(e) {
d3.selectAll(".timelineLines").classed("notSelected",false).classed("notselectedLine",false).classed("selected",false).classed("notSelected",false)
d3.selectAll("circle").classed("notselectedLine",false).classed("notSelected",false).classed("selected",false).classed("notSelected",false)
d3.selectAll("text").classed("notText",false).style("font-weight", 400).style("display", "block")
d3.selectAll(".keyword").style("font-weight", 400)
})

//sound

d3.select("#soundbutton").on('click', function() {
  if (soundtoggle) {
    soundtoggle = !soundtoggle;
    d3.select("#soundbutton").attr("src", "images/sound-off.svg")
    Tone.Transport.stop();
  } else if (!soundtoggle) {
    soundtoggle = !soundtoggle;
    d3.select("#soundbutton").attr("src", "images/sound-on.svg")
    Tone.Transport.start();
  }
});


// filters and sorting

d3.select('input[value="temporal"]').on('change', function() {
  if (this.checked) {

    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)

    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
    d3.select("#closedsidebar").style("display", "none")
    d3.select(".sidebar").style("display", "none")
    d3.selectAll(".timelineLines").classed("notSelected",false)
    d3.selectAll("circle").classed("notselectedLine",false)
    d3.selectAll("text").classed("notText",false)
    d3.selectAll("text").classed("entFilteredOut",false)

    $(function() {
      $('#search').select2('data', null)
    })

    d3.selectAll("svg > *").remove();

     // the timelines

  let timelinesG = d3.select("#chart")
  .select("svg")
  .selectAll(".timelines")
  //sort data by date
  .data(keywordsAll.sort(function(a, b) {
    return d3.ascending(a.date, b.date);
  }))
  // .data(keywordsAll)
  .join("g")
  .classed("backgroundTimelineG", true)
.classed("people", function (d) { if (keywordsPeople.filter(function(D){return D==d}).length>0){return true}else{return false}})
.classed("places", function (d) { if (keywordsPlace.filter(function(D){return D==d}).length >0){return true}else{return false}})
.classed("works", function (d) { if (keywordsWorks.filter(function(D){return D==d}).length >0){return true}else{return false}})
.classed("artistic", function (d) { if (keywordsArtistic.filter(function(D){return D==d}).length >0){return true}else{return false}})
.classed("additional", function (d) { if (keywordsAdditional.filter(function(D){return D==d}).length >0){return true}else{return false}})

//append text from "keyword" to the timeline

timelinesG.append("text")
.text(function(d){
if(d.keyword.length >= 20){return d.keyword.slice(0, 20) + "[…]"}
else{return d.keyword}})
.attr("x", 320)
.attr("y", function(d,i){return 10+i*20+3})
.attr("font-size", "12px")
.attr("text-weight", 400)
.style("text-anchor", "end")
.classed("keyword", true)
.classed("people", function (d) { if (keywordsPeople.filter(function(D){return D==d}).length >0){return true}else{return false}})
.classed("places", function (d) { if (keywordsPlace.filter(function(D){return D==d}).length >0){return true}else{return false}})
.classed("works", function (d) { if (keywordsWorks.filter(function(D){return D==d}).length >0){return true}else{return false}})
.classed("artistic", function (d) { if (keywordsArtistic.filter(function(D){return D==d}).length >0){return true}else{return false}})
.classed("additional", function (d) { if (keywordsAdditional.filter(function(D){return D==d}).length >0){return true}else{return false}})
.classed("category", true)
.classed("cinema", function(d){
  if(keywordsData.filter(function(D){return (D.placesSplit.filter(function(place){return d.keyword==place})).length>0
    || (D.peopleSplit.filter(function(people){return d.keyword==people})).length>0
    || (D.worksSplit.filter(function(works){return d.keyword==works})).length>0
    || (D.artisticSplit.filter(function(artistic){return d.keyword==artistic})).length>0
    || (D.additionalSplit.filter(function(additional){return d.keyword==additional})).length>0}).filter(function(event){return event.category.includes("Cinema") == true || event.category.includes("Graphic") == true}).length >0)
  {return true}else{return false}
})
.classed("biography", function(d){
  if(keywordsData.filter(function(D){return (D.placesSplit.filter(function(place){return d.keyword==place})).length>0
    || (D.peopleSplit.filter(function(people){return d.keyword==people})).length>0
    || (D.worksSplit.filter(function(works){return d.keyword==works})).length>0
    || (D.artisticSplit.filter(function(artistic){return d.keyword==artistic})).length>0
    || (D.additionalSplit.filter(function(additional){return d.keyword==additional})).length>0}).filter(function(event){return event.category.includes("Biography") == true || event.category.includes("Apartment") == true}).length >0)
  {return true}else{return false}
})
.classed("writing", function(d){
  if(keywordsData.filter(function(D){return (D.placesSplit.filter(function(place){return d.keyword==place})).length>0
    || (D.peopleSplit.filter(function(people){return d.keyword==people})).length>0
    || (D.worksSplit.filter(function(works){return d.keyword==works})).length>0
    || (D.artisticSplit.filter(function(artistic){return d.keyword==artistic})).length>0
    || (D.additionalSplit.filter(function(additional){return d.keyword==additional})).length>0}).filter(function(event){return event.category.includes("Writing") == true}).length >0)
  {return true}else{return false}
})

timelinesG.append("line")
.attr("x1", 350)  //start of timeline
.attr("y1", function(d,i){return 10+i*20})
.attr("x2", width-200)  //end of timeline
.attr("y2", function(d,i){return 10+i*20})
// .attr("stroke", "white")
// .attr("stroke-width", 3)
.style("stroke", "grey")
.style("stroke", ("6, 5"))
.style("opacity", 0.05)
.classed("timeline", true)

// circles for timeline

timelinesG.each(function(D,I){
d3.select(this).selectAll(".timelineNodes").append("g")
.data(keywordsData.filter(function (d) {
  if(d.uncertaintystart === 0 && d.vend === ""){
    return ((d.placesSplit.filter(function(place){return D.keyword==place}).length >0) || (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) || (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) || (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) || (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0))
     && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
}}))
.join("circle")
.classed("circles", true)
.attr("r",3)
.attr("cx", function(d,i){
let date = new Date (d.vstart)
//console.log(date + "-" + timelineXScale(date))
return timelineXScale(date)})
.attr("cy", function(){return 10+I*20})
.classed("cinema", function (d) {if (d.category1 == true && d.category2 == false && d.category3 == false)
{return true}else{return false}})
.classed("biography", function (d) {
if (d.category2 == true && d.category1 == false && d.category3 == false)
{
return true;
} else{return false}
})
.classed("writing", function (d) {
if (d.category3 == true && d.category1 == false && d.category2 == false)
{
return true;
} else{return false}
})
.classed("cinebio", function (d) {
if (d.category1 == true && d.category2 == true && d.category3 == false)
{
return true;
}  else{return false}
})
.classed("biowrit", function (d) {
if (d.category1 == false && d.category2 == true && d.category3 == true)
{
return true;
}  else{return false}
})
.classed("cinewrit", function (d) {
if (d.category1 == true && d.category2 == false && d.category3 == true)
{
return true;
}  else{return false}
})
.classed("allcat", function (d) {
if (d.category1 == true && d.category2 == true && d.category3 == true)
{
return true;
}  else{return false}
})
.classed("people", function (d) {
  if (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) {
    return true;
    }else{ return false};
    })
.classed("places", function (d) {
  if (d.placesSplit.filter(function(place){return D.keyword==place}).length >0) {
    return true;
    }else{ return false};
    })
.classed("works", function (d) {
  if (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) {
    return true;
    }else{ return false};
    })
.classed("artistic", function (d) {
  if (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) {
    return true;
    }else{ return false};
    })
.classed("additional", function (d) {
  if (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0) {
    return true;
    }else{ return false};
    })

//tooltip
.on('mousemove', function (event, d) {
tooltip
.style('position', 'absolute')
.style('left', `${event.pageX + 5}px`)
.style('top', `${event.pageY + 10}px`)
.style('display', 'inline-block')
.style('opacity', '0.9')
.html(`
${replaceTemporal(d, (vdateStart) => `<p class="date">${formatTime(d.vdateStart)}</p>`)}
${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
<p class="tooltip-title">${d.title}</p>`);
})

.on('click', function (event, d) {

  d3.selectAll(".timelineLines").classed("notSelectedLine", true).classed("selectedLine", false)
  d3.selectAll(".circles").classed("notSelected", true).classed("selected", false)
  d3.select(this).classed("selectedLine", true).classed("notSelectedLine", false)

d3.select("#closedsidebar").style("display", "block")
sidebar
.style('display', 'block')
.html(`
${replaceTemporal(d, (vdateStart) => `<p class="date">${formatTime(d.vdateStart)}</p>`)}
${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
${conditionalReturn(d.title, (title) => `<p class="title">${title}</p>`)}
${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
<br/>
${conditionalReturn(d.category1, (category1) => `<p><span class="key-dot cinema"></span>Cinema and Theatre<br></p>`)}
${conditionalReturn(d.category2, (category2) => `<p><span class="key-dot biography"></span>Biography and Personality<br></p>`)}
${conditionalReturn(d.category3, (category3) => `<p><span class="key-dot writing"></span>Writing and Teaching<br></p>`)}

`)

})
.on('mouseout', function (d) {
tooltip.style('display', 'none');
tooltip.style('opacity', 0);

d3.selectAll(".circles")
.style("opacity", 1)
})
.on('mouseout', function (d) {
tooltip.style('display', 'none');
tooltip.style('opacity', 0);

d3.selectAll(".circles")
.style("opacity", 1)
});
d3.selectAll("#closedsidebar")
.on('click', function (d, event) {
  event.stopPropagation()
d3.select(".sidebar")
.style("display", "none")

d3.selectAll(".circles").classed("notSelected", false).classed("selected", false)
d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("selectedLine", false)

d3.select("#closedsidebar").style("display", "none")

});
})

//spans

timelinesG.each(function(D,I){
d3.select(this).selectAll(".timelineLines").append("g")
.data(keywordsData.filter(function (d) {
  if (d.vend.includes("-")) {
return ((d.placesSplit.filter(function(place){return D.keyword==place}).length >0) || (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) || (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) || (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) || (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0)) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != ""//took out some data points that create errors for now
} }))
.join("line")
.classed("timelineLines", true)
.attr("stroke-width", 6)
.classed("cinema", function (d) {
  if (d.category1 == true && d.category2 == false && d.category3 == false) {
    return true;
  } return false;
})
.classed("biography", function (d) {
if (d.category2 == true && d.category1 == false && d.category3 == false)
{
return true;
} else{return false}
})
.classed("writing", function (d) {
if (d.category3 == true && d.category1 == false && d.category2 == false)
{
return true;
} else{return false}
})
.classed("cinebio", function (d) {
if (d.category1 == true && d.category2 == true && d.category3 == false)
{
return true;
}  else{return false}
})
.classed("biowrit", function (d) {
if (d.category1 == false && d.category2 == true && d.category3 == true)
{
return true;
}  else{return false}
})
.classed("cinewrit", function (d) {
if (d.category1 == true && d.category2 == false && d.category3 == true)
{
return true;
}  else{return false}
})
.classed("allcat", function (d) {
if (d.category1 == true && d.category2 == true && d.category3 == true)
{
return true;
}  else{return false}
})
.classed("people", function (d) {
  if (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) {
    return true;
    }else{ return false};
    })
.classed("places", function (d) {
  if (d.placesSplit.filter(function(place){return D.keyword==place}).length >0) {
    return true;
    }else{ return false};
    })
.classed("works", function (d) {
  if (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) {
    return true;
    }else{ return false};
    })
.classed("artistic", function (d) {
  if (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) {
    return true;
    }else{ return false};
    })
.classed("additional", function (d) {
  if (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0) {
    return true;
    }else{ return false};
    })
  .attr("x1", function(d,i){
    let date = new Date (d.vstart)
  // console.log(date + "-" + timelineXScale(date))
    return timelineXScale(date)})
  .attr("y1", function(){return 10+I*20})
  .attr("x2", function(d,i){
    let date = new Date (d.vend)
  // console.log(date + "-" + timelineXScale(date))
  // console.log(d.vend + "-" +date + "-" + timelineXScale(date))
  if (timelineXScale(date) - timelineXScale(date) < 5) {
    return timelineXScale(date) + 5
  } else {
    return timelineXScale(date)
  }
  })
    // return timelineXScale(date)})
  .attr("y2", function(){return 10+I*20})
.on('mousemove', function (event, d) {
tooltip
.style('position', 'absolute')
.style('left', `${event.pageX + 5}px`)
.style('top', `${event.pageY + 10}px`)
.style('display', 'inline-block')
.style('opacity', '0.9')
.html(`
        ${replaceTemporal(d, (vdateStart) => `<b><p class="date">${formatTime(d.vdateStart)}</b> to <b>${formatTime(d.vdateEnd)}</b></p>`)}
        ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
        <p class="tooltip-title">${d.title}</p>`);
})
.on('click', function (event, d) {

  d3.selectAll(".timelineLines").classed("notSelectedLine", true).classed("selectedLine", false)
  d3.selectAll(".circles").classed("notSelected", true).classed("selected", false)
  d3.select(this).classed("selectedLine", true).classed("notSelectedLine", false)

d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
sidebar
.style('display', 'block')
.html(`
${replaceTemporal(d, (vdateStart) => `<b><p class="date">${formatTime(d.vdateStart)}</b> to <b>${formatTime(d.vdateEnd)}</b></p>`)}
${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
${conditionalReturn(d.title, (title) => `<p class="title">${title}</p>`)}
${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
<br/>
${conditionalReturn(d.category1, (category1) => `<span class="key-dot cinema"></span>Cinema and Theatre<br>`)}
${conditionalReturn(d.category2, (category2) => `<span class="key-dot biography"></span>Biography and Personality<br>`)}
${conditionalReturn(d.category3, (category3) => `<span class="key-dot writing"></span>Writing and Teaching<br>`)}

`)

})
.on('mouseout', function (d) {
tooltip.style('display', 'none');
tooltip.style('opacity', 0);

d3.selectAll(".timelineLines")
.style("opacity", 1)
})
d3.selectAll("#closedsidebar")
.on('click', function (d, event) {
  event.stopPropagation()
d3.select(".sidebar")
.style("display", "none")

d3.selectAll(".circles").classed("notSelected", false).classed("selected", false)
d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("selectedLine", false)

d3.select("#closedsidebar").style("display", "none")

})
})

//insert symbols

// symbols for keyword categories

timelinesG.each(function(D,I){
  d3.select(this).selectAll(".symbols").append("g")
  .data(keywordsData.filter(function (d) {
        return (d.placesSplit.filter(function(place){return D.keyword==place}).length >0) || (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) || (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) || (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) || (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
              }))

.join("image")
.attr("transform", function(d,i){
return "translate(340," + (2+I*20) + ")"})
.attr("xlink:href", function(d){

        if( d.placesSplit.filter(function(place){return D.keyword==place}).length >0){
          return "images/entities_icons/diamond.svg"
        } else if( d.peopleSplit.filter(function(people){return D.keyword==people}).length >0){
          return "images/entities_icons/triangle.svg"
        } else if( d.worksSplit.filter(function(work){return D.keyword==work}).length >0){
          return "images/entities_icons/threeprong.svg"
        } else if( d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0){
          return "images/entities_icons/square.svg"
        } else if( d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0){
          return "images/entities_icons/plus.svg"
        }
         })
         .attr("width", 12+"px")
         .attr("height", 12+"px")
.attr("opacity", 1)

})

  }
})

d3.select('input[value="frequency"]').on('change', function() {
  if (this.checked) {

    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)

    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
    d3.select("#closedsidebar").style("display", "none")
    d3.select(".sidebar").style("display", "none")
    d3.selectAll(".timelineLines").classed("notSelected",false)
    d3.selectAll("circle").classed("notselectedLine",false)
    d3.selectAll("text").classed("notText",false)
    d3.selectAll("text").classed("entFilteredOut",false)

    $(function() {
      $('#search').select2('data', null)
    })

      d3.selectAll("svg > *").remove();

      let timelinesG = d3.select("#chart")
      .select("svg")
      .selectAll(".timelines")
//sort keywordsAll by "count" descending
      .data(keywordsAll.sort(function(a,b){return b.count-a.count}))
      .join("g")
      .classed("backgroundTimelineG", true)
      .classed("people", function (d) { if (keywordsPeople.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("places", function (d) { if (keywordsPlace.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("works", function (d) { if (keywordsWorks.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("artistic", function (d) { if (keywordsArtistic.filter(function(D){return D==d}).length >0){return true}else{return false}})
  .classed("additional", function (d) { if (keywordsAdditional.filter(function(D){return D==d}).length >0){return true}else{return false}})

      timelinesG.append("text")
      .text(function(d){
        if(d.keyword.length >= 20){return d.keyword.slice(0, 20) + "[…]"}
        else{return d.keyword}})
      .attr("x", 320)
      .attr("y", function(d,i){return 10+i*20+3})
      .attr("font-size", "12px")
      .attr("text-weight", 400)
      .style("text-anchor", "end")
      .classed("keyword", true)
      .classed("people", function (d) { if (keywordsPeople.filter(function(D){return D==d}).length >0){return true}else{return false}})
      .classed("places", function (d) { if (keywordsPlace.filter(function(D){return D==d}).length >0){return true}else{return false}})
      .classed("works", function (d) { if (keywordsWorks.filter(function(D){return D==d}).length >0){return true}else{return false}})
      .classed("artistic", function (d) { if (keywordsArtistic.filter(function(D){return D==d}).length >0){return true}else{return false}})
      .classed("additional", function (d) { if (keywordsAdditional.filter(function(D){return D==d}).length >0){return true}else{return false}})
      .classed("category", true)
      .classed("cinema", function(d){
        if(keywordsData.filter(function(D){return (D.placesSplit.filter(function(place){return d.keyword==place})).length>0
          || (D.peopleSplit.filter(function(people){return d.keyword==people})).length>0
          || (D.worksSplit.filter(function(works){return d.keyword==works})).length>0
          || (D.artisticSplit.filter(function(artistic){return d.keyword==artistic})).length>0
          || (D.additionalSplit.filter(function(additional){return d.keyword==additional})).length>0}).filter(function(event){return event.category.includes("Cinema") == true || event.category.includes("Graphic") == true}).length >0)
        {return true}else{return false}
      })
      .classed("biography", function(d){
        if(keywordsData.filter(function(D){return (D.placesSplit.filter(function(place){return d.keyword==place})).length>0
          || (D.peopleSplit.filter(function(people){return d.keyword==people})).length>0
          || (D.worksSplit.filter(function(works){return d.keyword==works})).length>0
          || (D.artisticSplit.filter(function(artistic){return d.keyword==artistic})).length>0
          || (D.additionalSplit.filter(function(additional){return d.keyword==additional})).length>0}).filter(function(event){return event.category.includes("Biography") == true || event.category.includes("Apartment") == true}).length >0)
        {return true}else{return false}
      })
      .classed("writing", function(d){
        if(keywordsData.filter(function(D){return (D.placesSplit.filter(function(place){return d.keyword==place})).length>0
          || (D.peopleSplit.filter(function(people){return d.keyword==people})).length>0
          || (D.worksSplit.filter(function(works){return d.keyword==works})).length>0
          || (D.artisticSplit.filter(function(artistic){return d.keyword==artistic})).length>0
          || (D.additionalSplit.filter(function(additional){return d.keyword==additional})).length>0}).filter(function(event){return event.category.includes("Writing") == true}).length >0)
        {return true}else{return false}
      })

  timelinesG.append("line")
  .attr("x1", 350)  //start of timeline
  .attr("y1", function(d,i){return 10+i*20})
  .attr("x2", width-200)  //end of timeline
  .attr("y2", function(d,i){return 10+i*20})
  // .attr("stroke", "white")
  // .attr("stroke-width", 3)
  .style("stroke", "grey")
  .style("stroke", ("6, 5"))
  .style("opacity", 0.05)
  .classed("timeline", true)

  // circles for timeline

  timelinesG.each(function(D,I){
  d3.select(this).selectAll(".timelineNodes").append("g")
  .data(keywordsData.filter(function (d) {
    if(d.uncertaintystart === 0 && d.vend === ""){
      return ((d.placesSplit.filter(function(place){return D.keyword==place}).length >0) || (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) || (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) || (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) || (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0))
       && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
  }}))
  .join("circle")
  .classed("circles", true)
  .attr("r",3)
  .attr("cx", function(d,i){
  let date = new Date (d.vstart)
  //console.log(date + "-" + timelineXScale(date))
  return timelineXScale(date)})
  .attr("cy", function(){return 10+I*20})
  .classed("cinema", function (d) {
    if (d.category1 == true && d.category2 == false && d.category3 == false) {
      return true;

    } return false;
  })
  .classed("biography", function (d) {
    if (d.category2 == true && d.category1 == false && d.category3 == false) {
      return true;
    } return false;
  })
  .classed("writing", function (d) {
    if (d.category3 == true && d.category1 == false && d.category2 == false) {
      return true;
    } return false;
  })
  .classed("cinebio", function (d) {
    if (d.category1 == true && d.category2 == true && d.category3 == false) {
      return true;
    } return false;
  })
  .classed("biowrit", function (d) {
    if (d.category1 == false && d.category2 == true && d.category3 == true) {
      return true;
    } return false;
  })
  .classed("cinewrit", function (d) {
    if (d.category1 == true && d.category2 == false && d.category3 == true) {
      return true;
    } return false;
  })
  .classed("allcat", function (d) {
    if (d.category1 == true && d.category2 == true && d.category3 == true) {
      return true;
    } return false;
  })
  .classed("people", function (d) {
    if (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) {
      return true;
      }else{ return false};
      })
  .classed("places", function (d) {
    if (d.placesSplit.filter(function(place){return D.keyword==place}).length >0) {
      return true;
      }else{ return false};
      })
  .classed("works", function (d) {
    if (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) {
      return true;
      }else{ return false};
      })
  .classed("artistic", function (d) {
    if (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) {
      return true;
      }else{ return false};
      })
  .classed("additional", function (d) {
    if (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0) {
      return true;
      }else{ return false};
      })

  //tooltip
  .on('mousemove', function (event, d) {
  tooltip
  .style('position', 'absolute')
  .style('left', `${event.pageX + 5}px`)
  .style('top', `${event.pageY + 10}px`)
  .style('display', 'inline-block')
  .style('opacity', '0.9')
  .html(`
  ${replaceTemporal(d, (vdateStart) => `<p class="date">${formatTime(d.vdateStart)}</p>`)}
  ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
  <p class="tooltip-title">${d.title}</p>`);
  })

  .on('click', function (event, d) {

    d3.selectAll(".timelineLines").classed("notSelectedLine", true).classed("selectedLine", false)
    d3.selectAll(".circles").classed("notSelected", true).classed("selected", false)
    d3.select(this).classed("selected", true).classed("notSelected", false)

  d3.select("#closedsidebar").style("display", "block")

  sidebar
  .style('display', 'block')
  .html(`
  ${replaceTemporal(d, (vdateStart) => `<p class="date">${formatTime(d.vdateStart)}</p>`)}
  ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
  ${conditionalReturn(d.title, (title) => `<p class="title">${title}</p>`)}
  ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
  ${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
  ${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
  ${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
  ${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
  ${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
  ${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
  ${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
  <br/>
  ${conditionalReturn(d.category1, (category1) => `<span class="key-dot cinema"></span>Cinema and Theatre<br>`)}
  ${conditionalReturn(d.category2, (category2) => `<span class="key-dot biography"></span>Biography and Personality<br>`)}
  ${conditionalReturn(d.category3, (category3) => `<span class="key-dot writing"></span>Writing and Teaching<br>`)}

  `)

  })
  .on('mouseout', function (d) {
  tooltip.style('display', 'none');
  tooltip.style('opacity', 0);

  d3.selectAll(".circles")
  .style("opacity", 1)
  })
  .on('mouseout', function (d) {
  tooltip.style('display', 'none');
  tooltip.style('opacity', 0);

  d3.selectAll(".circles")
  .style("opacity", 1)
  });
  d3.selectAll("#closedsidebar")
  .on('click', function (d, event) {
    event.stopPropagation()
  d3.select(".sidebar")
  .style("display", "none")

  d3.selectAll(".circles").classed("notSelected", false).classed("selected", false)
  d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("selectedLine", false)

  d3.select("#closedsidebar").style("display", "none")

  });
  })

  //spans

  timelinesG.each(function(D,I){
  d3.select(this).selectAll(".timelineLines").append("g")
.data(keywordsData.filter(function (d) {
  if (d.vend.includes("-")) {
return ((d.placesSplit.filter(function(place){return D.keyword==place}).length >0) || (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) || (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) || (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) || (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0)) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != ""//took out some data points that create errors for now
} }))
  .join("line")
  .classed("timelineLines", true)
  .attr("stroke-width", 6)
  .classed("cinema", function (d) {
    if (d.category1 == true && d.category2 == false && d.category3 == false) {
      return true;

    } return false;
  })
  .classed("biography", function (d) {
    if (d.category2 == true && d.category1 == false && d.category3 == false) {
      return true;
    } return false;
  })
  .classed("writing", function (d) {
    if (d.category3 == true && d.category1 == false && d.category2 == false) {
      return true;
    } return false;
  })
  .classed("cinebio", function (d) {
    if (d.category1 == true && d.category2 == true && d.category3 == false) {
      return true;
    } return false;
  })
  .classed("biowrit", function (d) {
    if (d.category1 == false && d.category2 == true && d.category3 == true) {
      return true;
    } return false;
  })
  .classed("cinewrit", function (d) {
    if (d.category1 == true && d.category2 == false && d.category3 == true) {
      return true;
    } return false;
  })
  .classed("allcat", function (d) {
    if (d.category1 == true && d.category2 == true && d.category3 == true) {
      return true;
    } return false;
  })
  .classed("people", function (d) {
    if (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) {
      return true;
      }else{ return false};
      })
  .classed("places", function (d) {
    if (d.placesSplit.filter(function(place){return D.keyword==place}).length >0) {
      return true;
      }else{ return false};
      })
  .classed("works", function (d) {
    if (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) {
      return true;
      }else{ return false};
      })
  .classed("artistic", function (d) {
    if (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) {
      return true;
      }else{ return false};
      })
  .classed("additional", function (d) {
    if (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0) {
      return true;
      }else{ return false};
      })
    .attr("x1", function(d,i){
      let date = new Date (d.vstart)
    // console.log(date + "-" + timelineXScale(date))
      return timelineXScale(date)})
    .attr("y1", function(){return 10+I*20})
    .attr("x2", function(d,i){
      let date = new Date (d.vend)
    // console.log(date + "-" + timelineXScale(date))
    // console.log(d.vend + "-" +date + "-" + timelineXScale(date))
    if (timelineXScale(date) - timelineXScale(date) < 5) {
      return timelineXScale(date) + 5
    } else {
      return timelineXScale(date)
    }
    })
      // return timelineXScale(date)})
    .attr("y2", function(){return 10+I*20})
  .on('mousemove', function (event, d) {
  tooltip
  .style('position', 'absolute')
  .style('left', `${event.pageX + 5}px`)
  .style('top', `${event.pageY + 10}px`)
  .style('display', 'inline-block')
  .style('opacity', '0.9')
  .html(`
          ${replaceTemporal(d, (vdateStart) => `<b><p class="date">${formatTime(d.vdateStart)}</b> to <b>${formatTime(d.vdateEnd)}</b></p>`)}
          ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
          <p class="tooltip-title">${d.title}</p>`);
  })
  .on('click', function (event, d) {

    d3.selectAll(".timelineLines").classed("notSelectedLine", true).classed("selectedLine", false)
    d3.selectAll(".circles").classed("notSelected", true).classed("selected", false)
    d3.select(this).classed("selectedLine", true).classed("notSelectedLine", false)


  d3.select("#closedsidebar").style("display", "block")
  /// sidebar for spans
  sidebar
  .style('display', 'block')
  .html(`
  ${replaceTemporal(d, (vdateStart) => `<b><p class="date">${formatTime(d.vdateStart)}</b> to <b>${formatTime(d.vdateEnd)}</b></p>`)}
  ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
  ${conditionalReturn(d.title, (title) => `<p class="title">${title}</p>`)}
  ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
  ${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
  ${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
  ${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
  ${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
  ${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
  ${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
  ${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
  <br/>
  ${conditionalReturn(d.category1, (category1) => `<span class="key-dot cinema"></span>Cinema and Theatre<br>`)}
  ${conditionalReturn(d.category2, (category2) => `<span class="key-dot biography"></span>Biography and Personality<br>`)}
  ${conditionalReturn(d.category3, (category3) => `<span class="key-dot writing"></span>Writing and Teaching<br>`)}
  `)

  })
  .on('mouseout', function (d) {
  tooltip.style('display', 'none');
  tooltip.style('opacity', 0);

  d3.selectAll(".timelineLines")
  .style("opacity", 1)
  })
  d3.selectAll("#closedsidebar")
  .on('click', function (d, event) {
    event.stopPropagation()
  d3.select(".sidebar")
  .style("display", "none")


  d3.selectAll(".circles").classed("notSelected", false).classed("selected", false)
  d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("selectedLine", false)


  d3.select("#closedsidebar").style("display", "none")

  })
  })

  //removed symbols

//insert symbols

// symbols for keyword categories

timelinesG.each(function(D,I){
  d3.select(this).selectAll(".symbols").append("g")
  .data(keywordsData.filter(function (d) {
        return (d.placesSplit.filter(function(place){return D.keyword==place}).length >0) || (d.peopleSplit.filter(function(people){return D.keyword==people}).length >0) || (d.worksSplit.filter(function(work){return D.keyword==work}).length >0) || (d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0) || (d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
              }))

.join("image")
.attr("transform", function(d,i){
return "translate(340," + (2+I*20) + ")"})
.attr("xlink:href", function(d){

        if( d.placesSplit.filter(function(place){return D.keyword==place}).length >0){
          return "images/entities_icons/diamond.svg"
        } else if( d.peopleSplit.filter(function(people){return D.keyword==people}).length >0){
          return "images/entities_icons/triangle.svg"
        } else if( d.worksSplit.filter(function(work){return D.keyword==work}).length >0){
          return "images/entities_icons/threeprong.svg"
        } else if( d.artisticSplit.filter(function(artistic){return D.keyword==artistic}).length >0){
          return "images/entities_icons/square.svg"
        } else if( d.additionalSplit.filter(function(additional){return D.keyword==additional}).length >0){
          return "images/entities_icons/plus.svg"
        }
         })
         .attr("width", 12+"px")
         .attr("height", 12+"px")
.attr("opacity", 1)

})

  }
})

// filter for categories

d3.select(".f_c").on("click", function() {
  d3.selectAll("text").classed("entFilteredOut", false).classed("notText", false).style("display", "block")
  $(function() {
    $('#search').select2('data', null)
  })

  twGain.gain.rampTo(-0.3,0.5);
  projGain.gain.rampTo(3.0,0.5);
  therGain.gain.rampTo(-0.5,0.5);
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".keyword").style("font-weight", 400)
    d3.selectAll(".keyword").filter(".cinema").style("font-weight", "bold")
    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("SelectedLine", false)
    d3.selectAll("circle").classed("selected", false).classed("notSelected", false)
    // d3.selectAll("text.cinema").classed("entFilteredOut", true).classed("notText", false)
    // d3.selectAll("text:not(.cinema)").classed("entFilteredOut", false).classed("notText", true)
    d3.selectAll("circle").filter(function (d) { return d.category.includes("Cinema") || d.category.includes("Graphic") }).classed("catFilteredOut", false)
    d3.selectAll("circle").filter(function (d) { return d.category.includes("Cinema") == false && d.category.includes("Graphic") == false }).classed("catFilteredOut", true)
    d3.selectAll(".timelineLines").filter(function (d) { return d.category.includes("Cinema") || d.category.includes("Graphic") }).classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").filter(function (d) { return d.category.includes("Cinema") == false && d.category.includes("Graphic") == false }).classed("catFilteredOut", true)
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll(".keyword").style("font-weight", 400)
    // d3.SelectAll("text").classed("entFilteredOut", false).classed("notText", false)
    d3.selectAll("circle").classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").classed("catFilteredOut", false)

    twGain.gain.rampTo(0.2,30)
    projGain.gain.rampTo(0.2,30);
    therGain.gain.rampTo(0.05,5);
  }
})

d3.select(".f_b").on("click", function() {
  d3.selectAll("text").classed("entFilteredOut", false).classed("notText", false).style("display", "block")
  $(function() {
    $('#search').select2('data', null)
  })

  twGain.gain.rampTo(-0.1,0.5);
  projGain.gain.rampTo(0.1,0.5);
  therGain.gain.rampTo(0.3,0.5);
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".keyword").style("font-weight", 400)
    d3.selectAll(".keyword").filter(".biography").style("font-weight", "bold")
    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
    d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("SelectedLine", false)
    d3.selectAll("circle").classed("selected", false).classed("notSelected", false)
    d3.selectAll("circle").filter(function (d) { return d.category.includes("Biography") || d.category.includes("Apartment") }).classed("catFilteredOut", false)
    d3.selectAll("circle").filter(function (d) { return d.category.includes("Biography") == false && d.category.includes("Apartment") == false }).classed("catFilteredOut", true)
    d3.selectAll(".timelineLines").filter(function (d) { return d.category.includes("Biography") || d.category.includes("Apartment") }).classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").filter(function (d) { return d.category.includes("Biography") == false && d.category.includes("Apartment") == false }).classed("catFilteredOut", true)

  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll(".keyword").style("font-weight", 400)
    // d3.SelectAll("text").classed("entFilteredOut", false).classed("notText", false)
    d3.selectAll("circle").classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").classed("catFilteredOut", false)
    twGain.gain.rampTo(0.2,30)
    projGain.gain.rampTo(0.2,30);
    therGain.gain.rampTo(0.05,5);
  }
})

d3.select(".f_w").on("click", function() {
  d3.selectAll("text").classed("entFilteredOut", false).classed("notText", false).style("display", "block")
  $(function() {
    $('#search').select2('data', null)
    d3.selectAll("text").classed("entFilteredOut", false).classed("notText", false)
  })

  twGain.gain.rampTo(3.5,1);
  projGain.gain.rampTo(0.1,1);
  therGain.gain.rampTo(-0.5,1);
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".keyword").style("font-weight", 400)
    d3.selectAll(".keyword").filter(".writing").style("font-weight", "bold")
    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
    d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("SelectedLine", false)
    d3.selectAll("circle").classed("selected", false).classed("notSelected", false)
    // d3.selectAll("text.writing").classed("entFilteredOut", true).classed("notText", false)
    // d3.selectAll("text:not(.writing)").classed("entFilteredOut", false).classed("notText", true)
    d3.selectAll("circle").filter(function (d) { return d.category.includes("Writing") }).classed("catFilteredOut", false)
    d3.selectAll("circle").filter(function (d) { return d.category.includes("Writing") == false }).classed("catFilteredOut", true)
    d3.selectAll(".timelineLines").filter(function (d) { return d.category.includes("Writing") }).classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").filter(function (d) { return d.category.includes("Writing") == false }).classed("catFilteredOut", true)
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll(".keyword").style("font-weight", 400)
    // d3.SelectAll("text").classed("entFilteredOut", false).classed("notText", false)
    d3.selectAll("circle").classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").classed("catFilteredOut", false)
    twGain.gain.rampTo(0.2,30)
    projGain.gain.rampTo(0.2,30);
    therGain.gain.rampTo(0.05,5);
  }
})

// filters for entities

//people

d3.select(".triangle").on("click", function() {
  d3.selectAll("text").classed("entFilteredOut", false).classed("notText", false).style("display", "block")
  $(function() {
    $('#search').select2('data', null)
  })

  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)
    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
    d3.selectAll("circle").classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").classed("catFilteredOut", false)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("text.people").style("font-weight", "bold").classed("notText", false)
    d3.selectAll("text:not(.people)").classed("notText", true).style("font-weight", 400)
    d3.selectAll(".timelineLines").filter(".people").classed("SelectedLine", true).classed("notSelectedLine", false)
    d3.selectAll(".timelineLines").filter(":not(.people)").classed("notSelectedLine", true).classed("SelectedLine", false)
    d3.selectAll("circle.people").classed("selected", true).classed("notSelected", false)
    d3.selectAll("circle:not(.people)").classed("selected", false).classed("notSelected", true)

  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("text").style("font-weight", 400).classed("notText", false)
    d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("SelectedLine", false)
    d3.selectAll("circle").classed("selected", false).classed("notSelected", false)
  }

})

//places

d3.select(".diamond").on("click", function() {
  d3.selectAll("text").classed("entFilteredOut", false).classed("notText", false).style("display", "block")
  d3.selectAll(".keyword").style("font-weight", 400)
  $(function() {
    $('#search').select2('data', null)
  })

  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)
    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
    d3.selectAll("circle").classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").classed("catFilteredOut", false)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("text.places").classed("notText", false).style("font-weight", "bold")
    d3.selectAll("text:not(.places)").classed("notText", true).style("font-weight", 400)
    d3.selectAll(".timelineLines").filter(".places").classed("SelectedLine", true).classed("notSelectedLine", false)
    d3.selectAll(".timelineLines").filter(":not(.places)").classed("notSelectedLine", true).classed("SelectedLine", false)
    d3.selectAll("circle.places").classed("selected", true).classed("notSelected", false)
    d3.selectAll("circle:not(.places)").classed("selected", false).classed("notSelected", true)

  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("text").style("font-weight", 400).classed("notText", false)
    d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("SelectedLine", false)
    d3.selectAll("circle").classed("selected", false).classed("notSelected", false)
  }

})

//works

d3.select(".threeprong").on("click", function() {
  d3.selectAll("text").classed("entFilteredOut", false).classed("notText", false).style("display", "block")
  d3.selectAll(".keyword").style("font-weight", 400)
  $(function() {
    $('#search').select2('data', null)
  })

  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)
    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
    d3.selectAll("circle").classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").classed("catFilteredOut", false)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("text.works").style("font-weight", "bold").classed("notText", false)
    d3.selectAll("text:not(.works)").classed("notText", true).style("font-weight", 400)
    d3.selectAll(".timelineLines").filter(".works").classed("SelectedLine", true).classed("notSelectedLine", false)
    d3.selectAll(".timelineLines").filter(":not(.works)").classed("notSelectedLine", true).classed("SelectedLine", false)
    d3.selectAll("circle.works").classed("selected", true).classed("notSelected", false)
    d3.selectAll("circle:not(.works)").classed("selected", false).classed("notSelected", true)
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("text").style("font-weight", 400).classed("notText", false)
    d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("SelectedLine", false)
    d3.selectAll("circle").classed("selected", false).classed("notSelected", false)
  }

})

//artistic concepts

d3.select(".square").on("click", function() {
  d3.selectAll("text").classed("entFilteredOut", false).classed("notText", false).style("display", "block")
  d3.selectAll(".keyword").style("font-weight", 400)
  $(function() {
    $('#search').select2('data', null)
  })

  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)
    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
    d3.selectAll("circle").classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").classed("catFilteredOut", false)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("text.artistic").style("font-weight", "bold").classed("notText", false)
    d3.selectAll("text:not(.artistic)").classed("notText", true).style("font-weight", 400)
    d3.selectAll(".timelineLines").filter(".artistic").classed("SelectedLine", true).classed("notSelectedLine", false)
    d3.selectAll(".timelineLines").filter(":not(.artistic)").classed("notSelectedLine", true).classed("SelectedLine", false)
    d3.selectAll("circle.artistic").classed("selected", true).classed("notSelected", false)
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("text").style("font-weight", 400).classed("notText", false)
    d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("SelectedLine", false)
    d3.selectAll("circle").classed("selected", false).classed("notSelected", false)
  }

})

//additional

d3.select(".plus").on("click", function() {
    $(function() {
    $('#search').select2('data', null)
  })
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)
    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
    d3.select(".sidebar").style("display", "none")
    d3.selectAll("circle").classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").classed("catFilteredOut", false)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("text.additional").style("font-weight","bold").classed("notText", false)
    d3.selectAll("text:not(.additional)").classed("notText", true).style("font-weight", 400)
    d3.selectAll(".timelineLines").filter(".additional").classed("SelectedLine", true).classed("notSelectedLine", false)
    d3.selectAll(".timelineLines").filter(":not(.additional)").classed("notSelectedLine", true).classed("SelectedLine", false)
    d3.selectAll("circle.additional").classed("selected", true).classed("notSelected", false)
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("text").style("font-weight", 400).classed("notText", false)
    d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("SelectedLine", false)
    d3.selectAll("circle").classed("selected", false).classed("notSelected", false)
  }

})

// filters for VR objects

d3.selectAll(".highlights p")
.on("click", function(d,i) {
  $(function() {
    $('#search').select2('data', null)
  })

  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll("text").classed("entFilteredOut", false).classed("notText", false).style("display", "block")
    d3.selectAll(".keyword").style("font-weight", 400)
    d3.selectAll(".timelineLines").classed("notSelectedLine", false).classed("SelectedLine", false)
    d3.selectAll("circle").classed("selected", false).classed("notSelected", false)
    d3.selectAll(".filter").style("font-weight", 400)
    d3.selectAll(".highlights p").style("font-weight", 400)
    d3.selectAll(".entities p").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    let selectedIdentifier = d3.select(this).attr("class") // get the class of the p tag that was clicked on
    console.log(selectedIdentifier)



    d3.selectAll("circle").filter(function(X,Y){return highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].events.includes(X.Event_ID) == true
  }).classed("catFilteredOut", false)
    d3.selectAll("circle").filter(function(X,Y){return highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].events.includes(X.Event_ID) == false
  }).classed("catFilteredOut", true)
    d3.selectAll(".timelineLines").filter(function(X,Y){return highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].events.includes(X.Event_ID) == true
  }).classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").filter(function(X,Y){return highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].events.includes(X.Event_ID) == false
  }).classed("catFilteredOut", true)

///to check for highlights: for each timeline count the number of elements, then substract the number of visible elements. if this is > 0 then there is a highlight visible in this timeline
d3.selectAll(".backgroundTimelineG").each(function(d){//console.log(d)
  if(d3.select(this).selectAll(".circles,.timelineLines").size()-d3.select(this).selectAll(".circles,.timelineLines").filter(".catFilteredOut").size() > 0)
    {d3.select(this).select("text").style("display", "block")}else{d3.select(this).select("text").style("display", "none")}
})

    d3.selectAll(".filter,.allfilter").style("font-weight", 400)
    d3.select("#closedhighlightbar").style("display", "block")

        // insert 'name' from highlightsData as a html element


/// sidebar for spans
highlightbar
        .html(`
        <h1 class="highlightsName">${highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].name}</h1>
        <p class="highlightsImage"><img src="images/objects/${highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].identifier}.png" alt="${highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].identifier}" width = "50%" height = "auto" class="image"></p>
        <p class="highlightsSubtitle">${highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].subtitle}</p>
        <p class="highlightsDescription">${highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].description}</p>
        <p class="highlightsDate">${highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].date}</p>
        <p class="highlightsLink"><a href="${highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].links}" target="_blank">${highlightsData.filter(function(D){return D.identifier ==  selectedIdentifier})[0].links}</a></p>

        `)
          .style('display', 'block')
          .attr('sidebarType', 'highlights')
  } else {
    d3.selectAll(".backgroundTimelineG").selectAll("text").style("display", "block")
    d3.select(this).style("font-weight", 400)
    d3.selectAll("text").style("display", "block")
    d3.selectAll("circle").classed("catFilteredOut", false)
    d3.selectAll(".timelineLines").classed("catFilteredOut", false)
    d3.select(".highlightbar").style("display", "none")
    d3.select("#closedhighlightbar").style("display", "none")
  }
})
d3.selectAll("#closedhighlightbar")
      .on('click', function (d) {

        d3.select(".highlightbar")
                  .style("display", "none")

                d3.selectAll(".circle").classed("catFilteredOut", false)
                d3.selectAll(".timelineLines").classed("catFilteredOut", false)

                d3.selectAll(".highlights p").style("font-weight", 400)
                d3.select("#closedhighlightbar").style("display", "none")


              })
    })


});
