// const got = require('got');
// const cheerio = require('cheerio');

console.log('js loaded');

function textInput(){
    document.getElementById("textDisp").innerHTML = document.getElementById("bookDesc").value;
}

function getIsbnCodes(){
    let uri = document.getElementById("amazonLink").value;
    console.log(uri);
    if(uri) {
        let pos = uri.lastIndexOf('/')+1;
        uri = uri.substring(0, pos);
        console.log(uri);
        got(uri).then(response => {
            let $ = cheerio.load(response.body);
                const elements = $('.contents li')
                elements.each((i, dat) => {
                    if ($(dat).each('b') == "ISBN-10:"){
                        document.getElementById("ISBN10").value = $(dat).text().match(/\".*?\"/)[0].trim(); 
                    }
                    if ($(dat).each('b') == "ISBN-13:"){
                        document.getElementById("ISBN13").value = $(dat).text().match(/\".*?\"/)[0].trim(); 
                    }
                    if ($(dat).each('b') == "ASIN:"){
                        document.getElementById("ASIN").value = $(dat).text().match(/\".*?\"/)[0].trim(); 
                    }
                })
        }).catch(err => {
            console.error('scrapeBooksList err: ', err);
        })
            
              
    }
}