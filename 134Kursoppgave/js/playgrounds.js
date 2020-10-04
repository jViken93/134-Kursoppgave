//URL til JSON-dokumentet
var url = 'https://hotell.difi.no/api/json/bergen/lekeplasser?';

// Variabel som holder informasjonen fra JSON-urlen
var playgroundDataSet;

//Søkekriterie lagres i denne variablen
var searchResult = [];


//Funsjoner som kjører ved åpning av siden
window.onload = function() {
    loadPlaygrounds();
    loadMap();
    placeList();
}


//Henter JSON dokumentet ved hjelp av funsjonen fra loadFile.js og lagrer informasjonen i playgroundDataset
//Returnerer et løfte som benyttes i alle funksjoner som henter data fra playgroundDataset
function loadPlaygrounds() {
    return new Promise(function (resolve, reject) {
        loadFile(url).then(function (fromResolve) {
            playgroundDataSet = fromResolve.entries;

            if (playgroundDataSet != null) {
                resolve(playgroundDataSet);
            } else {
                reject(console.log("Something went wrong"));
            }
        }).catch(function (fromReject) {
            console.log("Something went wrong" + fromReject)
        })
    })
}


//Laster inn kartet som skal vises på siden og plasserer markers med numerering som tilsvarer lekeplassene i listen
//For å gjøre dette itererer funksjonen gjennom playgroundDataset og henter informasjon om lenge- og breddegrader
function loadMap() {
    let mapcenter = {lat: 60.391850, lng: 5.322924};
    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: mapcenter
    });

    loadPlaygrounds().then(function () {
        for(i = 0; i<playgroundDataSet.length; i++){
            a = playgroundDataSet[i].latitude;
            b = playgroundDataSet[i].longitude;
            let sted = {lat:parseFloat(a), lng:parseFloat(b)};
            let marker3 = new google.maps.Marker({position:sted,map:map,label:(i + 1).toString()});
            console.log(a + " " + b)
        }
    }).catch(function (fromReject) {
        console.log(fromReject);
    })
}

//Iterer igjennom lekeplassene og legger dem til i listen som vises på siden.
function placeList() {
    loadPlaygrounds().then(function () {
        for(i = 0; i<playgroundDataSet.length; i++){
            let node = document.createElement("LI");
            let textnode = document.createTextNode((i + 1) + " " + playgroundDataSet[i].navn);
            node.appendChild(textnode);
            document.getElementById("myList").appendChild(node);
        }
    }).catch(function (fromReject) {
        console.log(fromReject);
    })
}


//Søkefunksjon med søkefelt.
//Her kan man skrive inn fritekst som blir matchet mot navnet på lekeplasser i datasettet.
function search() {
    loadPlaygrounds().then(function () {
        let input = document.getElementById('search').value;
        let input2 = String(input);
        let input3 = input2.toLowerCase();

        for(i = 0; i<playgroundDataSet.length; i++) {
            let name = playgroundDataSet[i].navn;
            let name2 = String(name);
            let name3 = name2.toLowerCase();

            if(name3.includes(input3, 0)) {
                searchResult.push(playgroundDataSet[i]);
                console.log(searchResult);
            }
        }

        markerUpdate();
        showSearch();
        searchResult = [];

    }).catch(function (fromReject) {
        console.log(fromReject);
    })
}

//Oppdaterer markersene på kartet slik at kun de som matcher søket vises
function markerUpdate(){
    console.log("way out there");
    let mapcenter = {lat: 60.391850, lng: 5.322924};
    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: mapcenter
    });

    for(i = 0; i<searchResult.length; i++){
        console.log("in heere");
        a = searchResult[i].latitude;
        b = searchResult[i].longitude;
        let sted = {lat:parseFloat(a), lng:parseFloat(b)};
        let marker3 = new google.maps.Marker({position:sted,map:map,label:(i + 1).toString()});

    }
}

//Oppdaterer listen med lekeplasser slik at kun de som matcher søket vises.
//Funksjonen fjerner først de eksisterende elementene før den legger til elementene som matcher søket.
function showSearch(){
    let elem = document.getElementById('myList');

    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }

    for(i = 0; i<searchResult.length; i++){
        let node = document.createElement("LI");
        let textnode = document.createTextNode((i+1) + " " + searchResult[i].navn);
        node.appendChild(textnode);
        elem.appendChild(node);
    }
}














