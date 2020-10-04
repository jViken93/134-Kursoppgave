let loadFile = function(url) {
    return new Promise(function (resolve, reject) {
        //Oppretter ett nytt Reguest-objekt
        var xhr = new XMLHttpRequest();

        //Spesifiserer hva som skal gjøres. Hvis ulr ikke er lagt inn som string korrigeres det her
        //Asynkronhet er satt til true - dvs at innholdet lastes så fort det er klart
        xhr.open('GET', String(url), true);

        // Responstyen er satt til JSON, dvs at den kun vil aksepetere filer av json-format i hht oppgaveteksten
        xhr.responseType = 'json';

        xhr.onload = function () {
            //Need to research status, is 200 correct
            if(this.status === 200 && this.response != null) {
                resolve(xhr.response);
                console.log("Getting there");
                console.log(xhr.response);

            } else {
                console.log('Noe gikk galt. Vennligst kontroller at url er en gyldig url til et JSON-dokument.');
                reject(xhr.statusText);
            }
        };

        xhr.onerror = function () {
            reject(xhr.statusText);
        }

        xhr.send();
    })
}















