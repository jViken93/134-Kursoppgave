//URL til JSON-dokumenter
var url = 'https://hotell.difi.no/api/json/bergen/lekeplasser?';
var url2 = 'https://hotell.difi.no/api/json/bergen/dokart?';

// Variabel som holder informasjonen fra lekeplass JSON-filen
var playgroundDataSet;

// Variabel som holder iformasjon fra toalett JSON-filen
var toiletDataSet;

//informasjonen til det som er blitt søkt på skal her
var searchResult = [];

//Variabel som holder kartet på siden
var map;



//Funsjoner som kjører ved åpning av siden
window.onload = function () {
    loadPlaygrounds()
    loadToilets();
    loadMap();
    placeDropdownElements();
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


//Henter JSON dokumentet ved hjelp av funsjonen fra loadFile.js og lagrer informasjonen i toiletDataset
//Returnerer et løfte som benyttes i alle funksjoner som henter data fra toiletDataset
function loadToilets() {
    return new Promise(function (resolve, reject) {
        loadFile(url2).then(function (fromResolve) {
            toiletDataSet = fromResolve.entries;

            if (toiletDataSet != null) {
                resolve(toiletDataSet);
            } else {
                reject(console.log("Something went wrong"))
            }
        }).catch(function (fromReject) {
            console.log("Something went wrong" + fromReject)
        })
    })
}


//Oppgave 7
//Denne funksjonen finner avstanden mellom to punkter ved hjelp av pytagoras setning.
//Funksjonen tar ikke hensyn til jordens krumming.
function findDistance(lat1, long1, lat2, long2) {
    let distanceLng = (long2 -long1) * Math.cos(lat1);
    let distanceLat = (lat2 - lat1);

    //Pytagoras: a^2 + b^2 = c^2 => c = sqr(a^2 + b^2)
    let ab = distanceLat*distanceLat + distanceLng*distanceLng;
    let distance = Math.sqrt(ab);
    return distance;
}


//Laster inn kartet som skal vises på siden
function loadMap() {
    var mapcenter = {lat: 60.391850, lng: 5.322924};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: mapcenter
    });
}

//OPPGAVE 8
//Iterer igjennom lekeplassene og legger dem til i select elementet som danner dropdown-listen på siden.
//Hvert element vil være klikkbart slik at brukeren kan velge sin favoritt fra denne listen.
function placeDropdownElements() {
    loadPlaygrounds().then(function () {
        let select = document.createElement("SELECT");
        for(i = 0; i<playgroundDataSet.length; i++){
            let option = document.createElement("option");
            let textOption = document.createTextNode(playgroundDataSet[i].navn);
            option.appendChild(textOption);
            //option.setAttribute("onClick", "loadFavorite(this)");
            option.addEventListener("click", function() {
                loadFavorite(this);
            });
            select.appendChild(option);
        }
        document.getElementById("dropdown").appendChild(select);
    }).catch(function (fromReject) {
        console.log(fromReject);
    })
}


//Søkefunksjon for frisøket på siden.
//Her kan man skrive inn fritekst i feltet, for eksempel stedsnavn, navn på lekeplass ol.
//Funksjonen matcher texten brukeren har skrevet inn med navnet på alle lekeplassene i playgroundDataset.
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

        showSearch();
        searchResult = [];

    }).catch(function (fromReject) {
        console.log(fromReject);
    })
}


//Oppdaterer alternativene i dropdown-listen slik at den kun viser lekeplasser som matcher frisøket.
function showSearch(){
    let elem = document.getElementById('dropdown');

    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }

    let select = document.createElement("SELECT");
    for(i = 0; i<searchResult.length; i++){
        let option = document.createElement("option");
        let textOption = document.createTextNode(searchResult[i].navn);
        option.appendChild(textOption);
        //option.setAttribute("onClick", "loadFavorite(this)");
        option.addEventListener("click", function() {
            loadFavorite(this);
        });
        select.appendChild(option);
    }
    elem.appendChild(select);
}


//Funksjon som oppdaterer siden basert på hvilken lekeplass som er valgt
//Se kommentering underveis for forklaring av kode.
function loadFavorite(clickedOption) {
    loadPlaygrounds().then(loadToilets()).then(function (fromResolve) {
        for(i = 0; i<playgroundDataSet.length; i++) {
            let fromClick = clickedOption.innerHTML;
            let fromDataset = playgroundDataSet[i].navn;

            //Funksjonenen matcher elementet brukeren trykket på med det samme elementet i playgroundDataset,
            //slik at funksjonen får tilgang på all tilgjengelig informasjon om den gitte lekeplassen.

            if (fromClick === fromDataset) {
                console.log('dataset entry is ' + fromDataset+ '.  clicked is ' + fromClick);

                //Lager et kart med sentrum i den valgte lekeplassen,
                // og plasserer en marker for lekeplassen

                latPlay = playgroundDataSet[i].latitude;
                lngPlay = playgroundDataSet[i].longitude;
                let sted = {lat:parseFloat(latPlay), lng:parseFloat(lngPlay)};
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 12,
                    center: sted
                });

                let markerP = new google.maps.Marker({position:sted,map:map,label:'L'});
                console.log(latPlay + " " + lngPlay);


                //Går så videre til å finne informasjon om nærmeste toalett
                latPlay2 = parseFloat(latPlay);
                lngPlay2 = parseFloat(lngPlay);


                //Variabler som lagrer informasjon om det nærmeste toalettet, slik at dette kan vises på siden
                let closest = 100000000000;
                let closestName;
                let openWeekday;
                let openSaturday;
                let openSunday;
                let herre;
                let pissoir;
                let stellerom;
                let rullestol;
                let address;
                let price;
                let dame;
                let toiletMarker;


                //Funksjonen itererer gjennom vært toalett og finner avstanden mellom det og lekeplassen.
                //Her benyttes funksjon fra oppgave 7 (findDistance)
                for(j = 0; j<toiletDataSet.length; j++) {
                    latToilet = (toiletDataSet[j].latitude);
                    lngToilet = toiletDataSet[j].longitude;
                    latToilet2 = parseFloat(latToilet);
                    lngToilet2 = parseFloat(lngToilet);

                    distance = findDistance(latPlay2, lngPlay2, latToilet2, lngToilet2)
                    console.log(distance);

                    //Hvis toalettet er nærmere enn det forrige lagres informasjon om toalettet
                    //Variablene vil da ha informasjon om det nermeste toalettet når loopen er ferdig.
                    if(distance < closest) {
                        closest = distance;
                        closestName = toiletDataSet[j].plassering;
                        openWeekday = toiletDataSet[j].tid_hverdag;
                        openSaturday = toiletDataSet[j].tid_lordag;
                        openSunday = toiletDataSet[j].tid_sondag;
                        herre = toiletDataSet[j].herre;
                        dame = toiletDataSet[j].dame;
                        pissoir = toiletDataSet[j].pissoir_only;
                        stellerom = toiletDataSet[j].stellerom;
                        rullestol = toiletDataSet[j].rullestol;
                        address = toiletDataSet[j].adresse;
                        price = toiletDataSet[j].pris;

                        toiletMarker = {lat:latToilet2, lng:lngToilet2};
                    }
                }
                console.log(toiletMarker, address, closest);

                //Oppretter en ny marker som viser det nærmeste toalettet
                let markerT = new google.maps.Marker({position:toiletMarker,map:map,label:'T'});


                //Endrer teksten på siden slik at informasjon om lekeplass og nermeste toalett vises.
                document.getElementById('valgtFavorittlekeplass').innerHTML = 'Din favorittlekeplass:  ' + fromDataset + ' (L)';
                document.getElementById('nermesteToalett').innerHTML = 'Nærmeste offentlige toalett:  ' + closestName + ' (T)';
                document.getElementById('infoOmToalett').innerHTML = 'Det nærmeste offentlige toalettet fra ' + fromDataset + ' er '
                + closestName.toLowerCase() +'. ';


                if(price !== "NULL"){
                    document.getElementById('infoOmToalett').innerHTML += 'Å besøke dette toalettet koster ' + price + '  kr. ';
                }

                if (herre === "1" && dame === "1") {
                    document.getElementById('infoOmToalett').innerHTML += "Toalettet er tilgjengelig for både damer og herrer. ";
                } else if (herre === "1" && dame !== "1") {
                    document.getElementById('infoOmToalett').innerHTML += "Toalettet er kun tilgjengelig for herrer. ";
                } else if (dame === "1" && herre !== "1") {
                    document.getElementById('infoOmToalett').innerHTML += "Toalettet er kun tilgjengelig for damer. ";
                }

                if (rullestol === 1 && stellerom === 1){
                    document.getElementById('infoOmToalett').innerHTML += "Toalettet har også rullestoltilgang og stellerom. ";
                } else if (rullestol === 1 && stellerom !== 1) {
                    document.getElementById('infoOmToalett').innerHTML += "Toalettet har også rullestoltilgang. ";
                } else if (rullestol !== 1 && stellerom === 1) {
                    document.getElementById('infoOmToalett').innerHTML += "Toalettet har også stellerom. Det kan desverre ikke garanteres at det er fremkommelighet for rullestolbrukere. ";
                }

                if (address !== "NULL") {
                    document.getElementById('infoOmToalett').innerHTML += "Adressen til toallettet er " + address + ", som også er vist på kartet under. ";
                }

                if (pissoir !== "NULL") {
                    document.getElementById('infoOmToalett').innerHTML += "NB! Dette toalettet er kun et pissoir." ;
                }

                let elem = document.getElementById('åpningstiderToalett');

                while (elem.firstChild) {
                    elem.removeChild(elem.firstChild);
                }

                if (openWeekday !== "NULL") {
                    let openingHours = document.createElement("li");
                    let textHours = document.createTextNode('Åpningstider man-fre: ' + openWeekday);
                    openingHours.appendChild(textHours);
                    document.getElementById("åpningstiderToalett").appendChild(openingHours);
                }

                if (openSaturday !== "NULL") {
                    let openingHours = document.createElement("li");
                    let textHours = document.createTextNode('Åpningstider lørdag: ' + openSaturday);
                    openingHours.appendChild(textHours);
                    document.getElementById("åpningstiderToalett").appendChild(openingHours);
                }

                if (openSunday !== "NULL") {
                    let openingHours = document.createElement("li");
                    let textHours = document.createTextNode('Åpningstider søndag: ' + openSunday);
                    openingHours.appendChild(textHours);
                    document.getElementById("åpningstiderToalett").appendChild(openingHours);
                }
            }
        }
    })
}





