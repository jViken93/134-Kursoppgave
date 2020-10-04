//URL til JSON-dokumentet
var url = 'https://hotell.difi.no/api/json/bergen/dokart?';

// Variabel som holder informasjonen fra JSON-urlen
var toiletDataSet;

//Det som skal bli søkt på blir plassert inni denne variablen
var searchObject = {};

//informasjonen til det som er blitt søkt på skal inni denne variablen
var searchResult = [];

//Det som kommer ut som "TRUE" i advancedSearch, blir plassert inn i denne arrayet
var result = [];


//Laster inn JSON dokumentet, kart, markører og listen over toaletter ved åpning av siden
window.onload = function () {
    loadToilets();
    loadMap();
    placeList();
}


//Henter JSON dokumentet og lagrer informasjonen i toiletdataset
//Returnerer et løfte som benyttes i flere andre funksjoner
function loadToilets() {
    return new Promise(function (resolve, reject) {
        loadFile(url).then(function (fromResolve) {
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




//For loopen iterer igjennom toiletDataSet listen og finner kordinatene til Toalett plasserinene og lager markes for dem.
function loadMap() {

  var mapcenter = {lat: 60.391850, lng: 5.322924}; //Setter kordinatene til Bergen
  var map = new google.maps.Map(document.getElementById('map'), { //Lager et nytt google maps
      zoom: 14,
      center: mapcenter
  });
        loadToilets().then(function () {
            for(i = 0; i<toiletDataSet.length; i++){
                a = toiletDataSet[i].latitude; //Variabel for latitude
                b = toiletDataSet[i].longitude; //Variabel for longitude
                let sted = {lat:parseFloat(a), lng:parseFloat(b)}; //parseFloater latitude og longitude
                let marker3 = new google.maps.Marker({position:sted,map:map,label:(i + 1).toString()}); //Setter markene for det som er i listen
                console.log(a + " " + b)
            }
        })
}


// Lager en liste over toalettene som vil vises i listen med id = 'mylist' på siden
function placeList() {
    loadToilets().then(function () {
        for(i = 0; i<toiletDataSet.length; i++){
            let node = document.createElement("LI"); //Lager et LI node
            let textnode = document.createTextNode((i+1) + " " + toiletDataSet[i].plassering); //Lager tekstNode som innholder det som skal i LI
            node.appendChild(textnode); //Appender textnode
            document.getElementById("myList").appendChild(node); //Appender det inn i MyList inne i HTML dokumentet
        }
    })
}


//Denne funksjonen lager regex utrykk for forskjellige variabler, og legger dem inn i searchObject
function regex(){
    input = document.getElementById('search').value.toLowerCase();


    let dame = /\s?(dame|lady)\s?/g; //regex uttrykk for dame
    let stellerom = /\s?(stellerom|skifterom)\s?/g; //regex uttrykk for stellerom
    let rullestol = /\s?(rullestol|Rullestoltilgang)\s?/g; //regex uttrykk for rullestol
    let herre = /\s?(herre|Mann)\s?/g; //regex uttrykk for herre
    let open = /\s?(open|åpen|nå)\s?/g; //regex uttrykk for open
    let klokke = /\s?(\d\d.\d\d)\s?/g; //regex uttrykk for klokke
    let pris = /\s?(pris:\d\d)\s?/g; //regex uttrykk for pris
    let gratis = /\s?(gratis)s?/g; //regex uttrykk for gratis



//Siden disse har kriterien "1" i listen, så lar vi "true" være "1". Da vil det se slik ut i searchObject når en skrive feks:
// herre inn i inputen. " Herre: "1" ".
    if(dame.test(input)){
        searchObject.dame = "1"; //Setter searchObject til "dame":"1"
    }

    if(stellerom.test(input)){
        searchObject.stellerom = "1"; //Setter searchObject til "stellerom":"1"
    }

    if(rullestol.test(input)){
        searchObject.rullestol = "1"; //Setter searchObject til "rullestol":"1"
    }

    if (herre.test(input)) {
        searchObject.herre = "1"; //Setter searchObject til "herre":"1"
    }

    if(open.test(input)){
        let time = new Date();
        let clock = time.getDay()

        if(clock === 6){ //Sjekker om det er lørdag.
            searchObject.tid_lordag = time.getHours() + "." + time.getMinutes(); //Får timer og minuter fra time variablen, og setter dem inn i searchObject
        }
        else if(clock === 0){ //Sjekker om det er søndag.
            searchObject.tid_sondag = time.getHours() + "." + time.getMinutes(); //Får timer og minuter fra time variablen, og setter dem inn i searchObject
        }
        else { //Hvis ingen av de andre ovenfor ikke stemmer er det hverdag.
            searchObject.tid_hverdag = time.getHours() + "." + time.getMinutes(); //Får timer og minuter fra time variablen, og setter dem inn i searchObject
        }
    }

    if(klokke.test(input)){
        let time = new Date();
        let day = time.getDay();

        if(day === 6){ //Sjekker om det er lørdag.
            /*Gjør string om til nummer med parseInt, splitter på ".",
            når vi bruker parseInt og splitter deler den det opp i et array.
            Vi må derfor hente ut [0] for timer, og [1] for minutter*/
            let hour = parseInt(input.split(".")[0]);
            let minutes = parseInt(input.split(".")[1]);
            searchObject.tid_lordag = hour + "." + minutes;
        }
        else if(day === 0){ //Sjekker om det er søndag.
            let hour = parseInt(input.split(".")[0]);
            let minutes = parseInt(input.split(".")[1]);
            searchObject.tid_sondag = hour + "." + minutes;
        }
        else{  //Hvis ingen av de andre ovenfor ikke stemmer er det hverdag.
            let hour = parseInt(input.split(".")[0]);
            let minutes = parseInt(input.split(".")[1]);
            searchObject.tid_hverdag = hour + "." + minutes;
        }
    }

    if(pris.test(input)){
        /*Gjør string om til nummer med parseInt, splitter på ":",
        når vi bruker parseInt og splitter deler den det opp i et array.
        Vi henter ut [1] for å faktisk få prisen*/
        let pris = parseInt(input.split(":")[1]);
        searchObject.pris = pris;

    }

    if(gratis.test(input)){
        searchObject.pris = "NULL"; //Setter pris til "NULL", som betyr at det er gratis
    }
}


//Denne funksjoner sjekker om checkboxene er blitt checked, gjør true om til "1", og plasserer dem inn i variablen searchObject
function checkIfcheckboxChecked(){

    clockInput = document.getElementById('clokcSearch').value.toLowerCase();
    priceInput = document.getElementById('priceSearch').value.toLowerCase();

    var checkboxes = document.getElementsByClassName('checked');

    let clock = /\s?(\d\d.\d\d)\s?/g; //regex uttrykk for klokke
    let toiletPrice = /\s?(pris:\d\d)\s?/g; //regex uttrykk for pris

    if(checkboxes.herre.checked){
        searchObject.herre = "1" //Hvis herre er checked, sett verdien til "1"
    }
    if(checkboxes.rullestol.checked){
        searchObject.rullestol = "1"; //Hvis rullestol er checked, sett verdien til "1"
    }
    if(checkboxes.dame.checked){
        searchObject.dame = "1"; //Hvis herre er dame, sett verdien til "1"
    }
    if(checkboxes.stellerom.checked){
        searchObject.stellerom = "1"; //Hvis stellerom er checked, sett verdien til "1"
    }

    if(checkboxes.gratis.checked){
      searchObject.pris = "NULL"; //Hvis gratis er checked, sett verdien til "NULL"
    }

    if(checkboxes.open.checked){
      let time = new Date();
      let clock = time.getDay()

      if(clock === 6){ //Sjekker om det er lørdag.
          searchObject.tid_lordag = time.getHours() + "." + time.getMinutes(); //Får timer og minuter fra time variablen, og setter dem inn i searchObject
      }
      else if(clock === 0){ //Sjekker om det er søndag.
          searchObject.tid_sondag = time.getHours() + "." + time.getMinutes(); //Får timer og minuter fra time variablen, og setter dem inn i searchObject
      }
      else {
          searchObject.tid_hverdag = time.getHours() + "." + time.getMinutes(); //Får timer og minuter fra time variablen, og setter dem inn i searchObject
      }
    }

    if(clock.test(clockInput)){
        let time = new Date();
        let day = time.getDay();

        if(day === 6){
          /*Gjør string om til nummer med parseInt, splitter på ".",
          når vi bruker parseInt og splitter deler den det opp i et array.
          Vi må derfor hente ut [0] for timer, og [1] for minutter*/
            let hour = parseInt(clockInput.split(".")[0]);
            let minutes = parseInt(clockInput.split(".")[1]);
            searchObject.tid_lordag = hour + "." + minutes;
        }
        else if(day === 0){
            let hour = parseInt(clockInput.split(".")[0]);
            let minutes = parseInt(clockInput.split(".")[1]);
            searchObject.tid_sondag = hour + "." + minutes;
        }
        else{
            let hour = parseInt(clockInput.split(".")[0]);
            let minutes = parseInt(clockInput.split(".")[1]);
            searchObject.tid_hverdag = hour + "." + minutes;
        }
    }

    if(toiletPrice.test(priceInput)){
        /*Gjør string om til nummer med parseInt, splitter på ":",
        når vi bruker parseInt og splitter deler den det opp i et array.
        Vi henter ut [1] for å faktisk få prisen*/
        let pris = parseInt(priceInput.split(":")[1]);
        searchObject.pris = pris;

    }
}

// Denne funksjonen sjekker sammenligner prisen og returnerer true hvis det finnes
function prisSearch(object, pris){

    if(object[pris].pris == "NULL"){ //Denne gjør "NULL" om til 0, slik at vi kan sammenligne dem med det som er i searchObject
        object[pris].pris = "0";
    }

    let price = parseInt(object[pris]); //parseInter fra String til Int
    let inputPrice = searchObject[pris];

    if(inputPrice >= price){ //Hvis inputPrise er høyere eller = price, returner true
        return true;
    }
}


/*funksjon som søker på tid og returnere true om den finnes, og false hvis ikke 
  @param object     tar en liste
  @param tid        tall som kan søker på*/
function timeSearch(object, tid){

  if(object[tid] == "ALL"){ //Pusher de som alltid er åpne til true.
    result.push(true)
  }

    if(object[tid] !== "ALL" && object[tid] !== "NULL"){ //Fjerner de elementene vi ikke kan splite


        /*Gjør string om til nummer med parseInt, splitter på ".",
        når vi bruker parseInt og splitter deler den det opp i et array.
        Vi må derfor hente ut [0] for timer, og [1] for minutter*/
        let openHour = parseInt(object[tid].split(" - ")[0].split(".")[0]);
        let openMinute = parseInt(object[tid].split(" - ")[0].split(".")[1]);

        let closeHour = parseInt(object[tid].split(" - ")[1].split(".")[0]);
        let closeMinute = parseInt(object[tid].split(" - ")[1].split(".")[1]);

        let searchHour = parseInt(searchObject[tid].split(".")[0]);
        let searchMinute = parseInt(searchObject[tid].split(".")[1]);



        if(searchHour >= openHour && searchHour <= closeHour) //Hvis denne stemmer, er det stengt
        {
            if(searchHour === openHour)
            {
                if(searchMinute >= openMinute) //Hvis searchHour = openHour må vi sjekke minuttene for å se om også de er like.
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            if(searchHour === closeHour)
            {
                if(searchMinute < closeMinute) //Hvis searchHour = closeHour må vi sjekke minuttene for å se om også de er like.
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
}


//Søker på det som variablen searchObject inneholder.
function search(){
    loadToilets().then(function () {
      //Sjekker om
        regex();
        checkIfcheckboxChecked();
        searchPlassering(toiletDataSet[i]);
        searchAdresse(toiletDataSet[i]);
        console.log(searchObject)

        let searchKeys = Object.keys(searchObject);

        if(searchKeys.length === 0){ //if searchKeys er 0, så skal ikke funksjonen gjøre noe
            return;
        }

        for(i = 0; i<toiletDataSet.length; i++){
            result = []; // will contain boolean values "true" for each param checked.
            for(j = 0; j<searchKeys.length; j++){
                if(toiletDataSet[i][searchKeys[j]] === searchObject[searchKeys[j]] && searchKeys.length !== 0){
                    result.push(true);
                }
                if(searchKeys[j].includes("tid")){ //if searchObject contains time, do this
                    if(timeSearch(toiletDataSet[i], searchKeys[j])){
                        result.push(true);
                    }
                }
                if(searchKeys[j].includes("pris")){ //if searchObject contains pris, do this
                    if(prisSearch(toiletDataSet[i], searchKeys[j])){
                        result.push(true);
                    }
                }
                if(result.length == searchKeys.length){ //if all params are true, søk is pushed.
                    searchResult.push(toiletDataSet[i])
                }
            }
        }
        console.log(searchResult)
        markerUpdate();
        showSearch();
        searchObject = {};
        searchResult = [];

    }).catch(function (fromReject) {
        console.log('Something went wrong' + fromReject);
    })
}


//Oppdaterer markesene med det som er blitt søkt på
function markerUpdate(){
  var mapProp= {
      center:new google.maps.LatLng(60.391850, 5.322924),
      zoom:14,
      };
  var map = new google.maps.Map(document.getElementById("map"),mapProp);

  for(i = 0; i<searchResult.length; i++){
    a = searchResult[i].latitude;
    b = searchResult[i].longitude;
    var sted = {lat:parseFloat(a), lng:parseFloat(b)};
    var marker3 = new google.maps.Marker({position:sted,map:map,label:(i+1).toString()})
    console.log(a + " " + b)
  }
}

//Denne funksjonen displayer søkeResultatet
function showSearch(){
    let elem = document.getElementById('myList');

    //Fjerner de eksiterende elementene
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }

    //Legger til nye elementer inn i myList
    for(i = 0; i<searchResult.length; i++){
        var node = document.createElement("LI");
        var textnode = document.createTextNode((i+1) + " " + searchResult[i].plassering);
        node.appendChild(textnode);
        document.getElementById("myList").appendChild(node);
    }
}

/*Funksjon som søker på adresse, og legger det inn i searchObject, slik av det kan bli søkt på i search
@object tar listen som et parameter*/
function searchPlassering(object) {
        let input = document.getElementById('search').value;
        let input2 = String(input);
        let input3 = input2.toLowerCase();

        for(i = 0; i<toiletDataSet.length; i++) {
            let name = toiletDataSet[i].plassering; //Henter ut alle adressen
            let name2 = String(name); //legger de inn i en string
            let name3 = name2.toLowerCase(); //Setter dem til toLowerCase

            if(input3.includes(name3)) {
                searchObject.plassering = toiletDataSet[i].plassering; //Legger plassering til i searchObject
                console.log(searchResult);
            }
        }
    }


/*Funksjon som søker på plassering, og legger det inn i searchObject, slik av det kan bli søkt på i search
@object tar listen som et parameter*/
function searchAdresse(object) {
        let input = document.getElementById('search').value;
        let input2 = String(input);
        let input3 = input2.toLowerCase();

        for(i = 0; i<toiletDataSet.length; i++) {
            let name = toiletDataSet[i].adresse; //henter ut alle adressen
            let name2 = String(name); //Legger de inn i en String
            let name3 = name2.toLowerCase(); //Setter dem til lovercase

            if(input3.includes(name3)) {
                searchObject.adresse = toiletDataSet[i].adresse;  //Legger adresse til i searchObject
                console.log(searchObject);
            }
        }
    }
