//URL til JSON-dokumentet
var url = 'http://www.barnehagefakta.no/api/Location/radius/60.391319/5.322122/0.03';

// Variabel som holder informasjonen fra JSON-urlen
var kindergartenDataSet;

//informasjonen til det som er blitt søkt på skal her
var searchResult = [];

//Object som holder filtreringsresultatene fra de tre dropdownmenyene
var searchObject = {};

//Laster inn JSON dokumentet ved åpning av siden
window.onload = function () {
    loadKindergarten();
    loadMap();
    placeTable();
}


//Henter JSON dokumentet og lagrer informasjonen i kindergartendDataset
//Returnerer et løfte som benyttes i flere andre funksjoner
function loadKindergarten() {
    return new Promise(function (resolve, reject) {
        loadFile(url).then(function (fromResolve) {
            kindergartenDataSet = fromResolve;

            if (kindergartenDataSet != null) {
                resolve(kindergartenDataSet);
            } else {
                reject(console.log("Something went wrong"));
            }
        }).catch(function (fromReject) {
            console.log("Something went wrong" + fromReject)
        })
    })
}


//Oppretter et kart på siden og fyller det med koordinatene til barnehagene.
//Tallet på markers og nr i tabellen er tilsvarende.
function loadMap() {

    var mapcenter = {lat: 60.391850, lng: 5.322924};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: mapcenter
    });
    loadKindergarten().then(function (fromResolve) {
        for(i = 0; i<kindergartenDataSet.length; i++){
            a = kindergartenDataSet[i].koordinatLatLng[0];
            b = kindergartenDataSet[i].koordinatLatLng[1];
            let sted = {lat:parseFloat(a), lng:parseFloat(b)};
            let marker3 = new google.maps.Marker({position:sted,map:map,label:(i + 1).toString()});
            console.log(a + " " + b)
        }
    })
}


//Henter informasjon fra datasettet og plasserer det i tabellen med id "myTable"
function placeTable() {
    console.log("before promise");
    loadKindergarten().then(function (fromResolve) {
        for(i = 0; i < kindergartenDataSet.length; i++) {
            console.log('inside for-loop');
            let tr = document.createElement("tr");

            let tdNumber = document.createElement('td');
            let textNumber = document.createTextNode(String(i+1));
            tdNumber.appendChild(textNumber);

            let tdName = document.createElement('td');
            let textName = document.createTextNode(kindergartenDataSet[i].navn);
            tdName.appendChild(textName);

            let tdAge = document.createElement('td');

            if(kindergartenDataSet[i].alder !== "") {
                let textAge = document.createTextNode(kindergartenDataSet[i].alder);
                tdAge.appendChild(textAge);
            } else {
                let textAge = document.createTextNode("Ukjent");
                tdAge.appendChild(textAge);
            }

            let tdOwnership = document.createElement('td');
            let textOwnership =  document.createTextNode(kindergartenDataSet[i].eierform);
            tdOwnership.appendChild(textOwnership);

            let tdNumKids = document.createElement('td');
            if("antallBarn" in kindergartenDataSet[i]) {
                let textNumKids = document.createTextNode(kindergartenDataSet[i].antallBarn);
                tdNumKids.appendChild(textNumKids);
            } else {
                let textNumKids = document.createTextNode("Ukjent");
                tdNumKids.appendChild(textNumKids);
            }


            tr.appendChild(tdNumber);
            tr.appendChild(tdName);
            tr.appendChild(tdAge);
            tr.appendChild(tdNumKids);
            tr.appendChild(tdOwnership);

            let table = document.getElementById("myTable");
            table.appendChild(tr);
            //for(j = 0; j < kindergartenDataSet[i].length; j++) {
            //  let td = document.createElement("td");
            //let text = document.createTextNode()

            //}
        }
    }).catch(function (fromReject) {
        console.log(fromReject)
    })
}


//Viser alternativene en kan velge mellom for private og offentlige barnehager
function showDropdown1() {
    document.getElementById("privatePublic").classList.toggle("show");
}

//Viser alternativene man kan velge mellom for antall barn
function showDropdown2() {
    document.getElementById("antallBarn").classList.toggle("show");
}

//Viser alternativene man kan velge mellom for aldergruppe
function showDropdown3() {
    document.getElementById("aldergruppe").classList.toggle("show");
}


//Funksjon som lukker dropdown-listene når man klikker utenfor skjermen
window.onclick = function(event) {
    if (!event.target.matches('.ddButton')) {

        let dropdownMenues = document.getElementsByClassName("dropdownContent");
        for (i = 0; i < dropdownMenues.length; i++) {
            let openDropdown = dropdownMenues[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}


//Registrerer hvilke alternativer som er klikket på
//Klikk registreres i et searchObjekt som benyttes i filtreringen
function addtoFilter(x) {
    let clicked = String(x.innerHTML);

    if(clicked === "Vis private") {
        searchObject.eierform = "privat";
    }

    if(clicked === "Vis offentlige") {
        searchObject.eierform = "kommunal";
    }

    if(clicked === "0 - 40") {
        searchObject.antallBarn = "0-40";
    }

    if(clicked === "40 - 80") {
        searchObject.antallBarn = "40-80";
    }

    if(clicked === "80 +") {
        searchObject.antallBarn = "80+";
    }

    if(clicked === "1 - 5") {
        searchObject.alder = "1 - 5";
    }

    if(clicked === "3 - 5") {
        searchObject.alder = "3 - 5";
    }
}

//funksjon som tar parameter barnehager og finner hvilken kategori(0-40, 40-80 eller 80+) de hører til gitt antall barn
function antallBarnInndeling(kindergarten) {

    let antallbarnDataset;

    if(kindergarten.antallBarn >= 0 && kindergarten.antallBarn < 40) {
        antallbarnDataset = "0-40";
    } else if (kindergarten.antallBarn >= 40 && kindergarten.antallBarn < 80) {
        antallbarnDataset = "40-80";
    } else if (kindergarten.antallBarn >= 80) {
        antallbarnDataset = "80+";
    }

    return antallbarnDataset;
}


//Funksjon som filtrerer resultatene gitt hva som er trykket på
function filter(x) {
    addtoFilter(x);

    //Hver av if-setningene filtreres resultatet gitt hva som er klikket på og lagret i search object

    if (("eierform" in searchObject) && (!("antallBarn" in searchObject)) && (!("alder" in searchObject))) {
        console.log("eierform");
        for(i = 0; i < kindergartenDataSet.length; i++) {
            if(String(kindergartenDataSet[i].eierform).toLowerCase() === searchObject.eierform) {
                searchResult.push(kindergartenDataSet[i])
            }
        }
        console.log(searchResult);

    } else if ((!("eierform" in searchObject)) && ("antallBarn" in searchObject) && (!("alder" in searchObject))) {
        console.log("antallBarn");
        for(i = 0; i < kindergartenDataSet.length; i++) {
            if((antallBarnInndeling(kindergartenDataSet[i])) === searchObject.antallBarn) {
                searchResult.push(kindergartenDataSet[i])
            }
        }
        console.log(searchResult);

    } else if ((!("eierform" in searchObject)) && (!("antallBarn" in searchObject)) && ("alder" in searchObject)) {
        console.log("alder");
        for(i = 0; i < kindergartenDataSet.length; i++) {
            if(String(kindergartenDataSet[i].alder).toLowerCase() === searchObject.alder) {
                searchResult.push(kindergartenDataSet[i])
            }
        }
        console.log(searchResult);

    } else if(("eierform" in searchObject) && (!("antallBarn" in searchObject)) && ("alder" in searchObject)) { //&& (searchObject.hasOwnProperty('antallBarn')) && !(searchObject.hasOwnProperty("alder"))) {
        console.log("eierform og alder");
        for(i = 0; i < kindergartenDataSet.length; i++) {
            if((String(kindergartenDataSet[i].alder).toLowerCase() === searchObject.alder) &&
                (String(kindergartenDataSet[i].eierform).toLowerCase() === searchObject.eierform)) {
                searchResult.push(kindergartenDataSet[i])
            }
        }
        console.log(searchResult);

    } else if(("eierform" in searchObject) && ("antallBarn" in searchObject) && (!("alder" in searchObject))) {
        console.log("eierform + barn");
        for(i = 0; i < kindergartenDataSet.length; i++) {
            if(((antallBarnInndeling(kindergartenDataSet[i])) === searchObject.antallBarn)
                && (String(kindergartenDataSet[i].eierform).toLowerCase() === searchObject.eierform)) {
                searchResult.push(kindergartenDataSet[i])
            }
        }
        console.log(searchResult);

    } else if((!("eierform" in searchObject)) && ("antallBarn" in searchObject) && ("alder" in searchObject)){
        console.log("antall barn + alder");
        for(i = 0; i < kindergartenDataSet.length; i++) {
            if(((antallBarnInndeling(kindergartenDataSet[i])) === searchObject.antallBarn)
            && (String(kindergartenDataSet[i].alder).toLowerCase() === searchObject.alder)) {
                searchResult.push(kindergartenDataSet[i])
            }
        }
        console.log(searchResult);

    } else if(("eierform" in searchObject) && ("antallBarn" in searchObject) && ("alder" in searchObject)) {
        console.log("alle er med");
        for(i = 0; i < kindergartenDataSet.length; i++) {
            if(((antallBarnInndeling(kindergartenDataSet[i])) === searchObject.antallBarn)
            && (String(kindergartenDataSet[i].alder).toLowerCase() === searchObject.alder)
            && (String(kindergartenDataSet[i].eierform).toLowerCase() === searchObject.eierform)) {
                searchResult.push(kindergartenDataSet[i]);
            }
        }
        console.log(searchResult);
    }
    updateMarkers();
    updateTable();
    searchResult = [];
    searchResult = [];
}

//Funksjon som oppdaterer markers på kart gitt søket
function updateMarkers() {
    var mapcenter = {lat: 60.391850, lng: 5.322924};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: mapcenter
    });

    for (i = 0; i < searchResult.length; i++) {
        a = searchResult[i].koordinatLatLng[0];
        b = searchResult[i].koordinatLatLng[1];
        let sted = {lat: parseFloat(a), lng: parseFloat(b)};
        let marker3 = new google.maps.Marker({position: sted, map: map, label: (i + 1).toString()});
        console.log(a + " " + b)
    }
}



//Oppdaterer informasjonen i tabellen gitt søket
function updateTable() {

    let table = document.getElementById("myTable");

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    let tr = document.createElement("tr");

    let tdNumber = document.createElement('td');
    let textNumber = document.createTextNode(' Nr ');
    tdNumber.appendChild(textNumber);

    let tdNavn = document.createElement('td');
    let textNavn = document.createTextNode(' Navn ');
    tdNavn.appendChild(textNavn);

    let tdAldersgruppe = document.createElement('td');
    let textAldersgruppe = document.createTextNode(' Aldersgruppe ');
    tdAldersgruppe.appendChild(textAldersgruppe);

    let tdAntallBarn = document.createElement('td');
    let textAntallBarn = document.createTextNode(' Antall Barn ');
    tdAntallBarn.appendChild(textAntallBarn);

    let tdEierform = document.createElement('td');
    let textEierform = document.createTextNode(' Eierform ');
    tdEierform.appendChild(textEierform);

    tr.appendChild(tdNumber);
    tr.appendChild(tdNavn);
    tr.appendChild(tdAldersgruppe);
    tr.appendChild(tdAntallBarn);
    tr.appendChild(tdEierform);

    table.appendChild(tr);


    for(i = 0; i < searchResult.length; i++) {
        console.log('inside for-loop');
        let tr = document.createElement("tr");

        let tdNumber = document.createElement('td');
        let textNumber = document.createTextNode(String(i+1));
        tdNumber.appendChild(textNumber);

        let tdName = document.createElement('td');
        let textName = document.createTextNode(searchResult[i].navn);
        tdName.appendChild(textName);

        let tdAge = document.createElement('td');

        if(searchResult[i].alder !== "") {
            let textAge = document.createTextNode(searchResult[i].alder);
            tdAge.appendChild(textAge);
        } else {
            let textAge = document.createTextNode("Ukjent");
            tdAge.appendChild(textAge);
        }

        let tdOwnership = document.createElement('td');
        let textOwnership =  document.createTextNode(searchResult[i].eierform);
        tdOwnership.appendChild(textOwnership);

        let tdNumKids = document.createElement('td');
        if("antallBarn" in searchResult[i]) {
            let textNumKids = document.createTextNode(searchResult[i].antallBarn);
            tdNumKids.appendChild(textNumKids);
        } else {
            let textNumKids = document.createTextNode("Ukjent");
            tdNumKids.appendChild(textNumKids);
        }


        tr.appendChild(tdNumber);
        tr.appendChild(tdName);
        tr.appendChild(tdAge);
        tr.appendChild(tdNumKids);
        tr.appendChild(tdOwnership);

        table.appendChild(tr);
        //for(j = 0; j < kindergartenDataSet[i].length; j++) {
        //  let td = document.createElement("td");
        //let text = document.createTextNode()

        //}
    }
}

function reset() {
    searchObject = {};
    searchResult = [];
    loadMap();
    placeTable();
}




