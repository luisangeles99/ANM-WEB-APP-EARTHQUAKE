//Google API MAPS
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAFeeqkNFImG6cXYX41JVkd4yCsa4e_3f4&callback=initMap';
script.async = true;

//local history
let history = JSON.parse(sessionStorage.getItem('historyArray'));
if(!history) {
    history = [];
}



let placeName = '';
let zip = '';

//city search location
$('#search').on('click', async function(){

    if(document.getElementById('check-zip').checked){
        let cityLocation = $('#cityName').val();
        let zipCode = $('#zipCode').val();

        if(!cityLocation || !zipCode) {
            alertContent('Introduce the name of a city or place. Introduce a valid 5 digit zip code');
            return;
        }

        $('#alert-form').addClass('hidden');
        $('#alert-map').addClass('hidden');

        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'http://api.geonames.org/postalCodeSearchJSON?postalcode=' + zipCode  + '&placename=' + cityLocation + '&username=luisangeles99',
                method: 'GET',
                dataType: 'json',
                success: function(data){
                    
                    if(data.postalCodes.length == 0) {
                        alertInfo('Place with name ' + cityLocation + ' and zip code' +  zipCode + ' was not found. Try changing parameters.');
                        resolve(data);
                        return
                    }
                    
                    lat = data.postalCodes[0].lat;
                    long = data.postalCodes[0].lng;
                    placeName = cityLocation;
                    zip = zipCode;

                    
                    
                    //low fidelity calculations we don't need a precise bbox
                    latMin = parseFloat(lat - (0.009 * 100)).toFixed(1);
                    latMax = parseFloat(lat + (0.009 * 100)).toFixed(1);
                    longMin = parseFloat(long - (0.009 * 100)).toFixed(1);
                    longMax = parseFloat(long + (0.009 * 100)).toFixed(1);
        
        
        
                    //
                    getEarthquakesCityLocation(latMin, latMax, longMin, longMax, lat, long);
                    resolve(data);
                    
        
                },
                error: function(error){
                    console.log('error' + error);
                    reject(error);
                }
            });
        });

    }
        
    else{
        let cityLocation = $('#cityName').val();
    
        if(!cityLocation) {
            alertContent('Introduce the name of a city or place.');
            return;
        }

        $('#alert-form').addClass('hidden');
        $('#alert-map').addClass('hidden');
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'http://api.geonames.org/postalCodeSearchJSON?placename=' + cityLocation + '&username=luisangeles99',
                method: 'GET',
                dataType: 'json',
                success: function(data){
                    
                    if(data.postalCodes.length == 0) {
                        alertInfo('Place with name ' + cityLocation + ' was not found. Try changing place or using zip code.');
                        resolve(data);
                        return
                    }
                    
                    lat = data.postalCodes[0].lat;
                    long = data.postalCodes[0].lng;
                    placeName = cityLocation;

                    
                    
                    //low fidelity calculations we don't need a precise bbox
                    latMin = parseFloat(lat - (0.009 * 100)).toFixed(1);
                    latMax = parseFloat(lat + (0.009 * 100)).toFixed(1);
                    longMin = parseFloat(long - (0.009 * 100)).toFixed(1);
                    longMax = parseFloat(long + (0.009 * 100)).toFixed(1);
        
        
        
                    //
                    getEarthquakesCityLocation(latMin, latMax, longMin, longMax, lat, long);
                    resolve(data);
                    
        
                },
                error: function(error){
                    console.log('error' + error);
                    alert(error);
                    reject(error);
                }
            });
        });
    }
});

//GET EARTHQUAKES IN BBOX PROVIDED
async function getEarthquakesCityLocation(latMin, latMax, longMin, longMax, lat, lng) {
    return new Promise((resolve, reject) => {
        $.ajax({ 
            url: 'http://api.geonames.org/earthquakesJSON?north=' + latMax + '&south= ' + latMin + '&east=' + longMax + '&west=' + longMin + '&username=luisangeles99',
            method: 'GET',
            dataType: 'json',
            success: (data) =>{
                updateMap(data.earthquakes, lat, lng);
                resolve(data);
            },
            error: (error) =>{
                console.log('error' + error);
                reject(error);
            }
        });
    });
    
}


//MAPS Generated USING GOOGLE API
async function initMap (markers){
    var options1 = {
        zoom:7,
        center:{lat: 25.686613, lng:-100.316116}
    }

    var options2 = {
        zoom:2,
        center:{lat: 0, lng:0}
    }

    //First map will display MONTERREY
    var map = new google.maps.Map(document.getElementById('map1'), options1);

    if(markers !== undefined) {
        for(let i = 0; i < markers.length; i++) {
            addMarkerEq(markers[i], map, i);
        }
    }

    //SECOND WILL SHOW LAST YEAR RECENT EARTHQUAKES
    var map2 = new google.maps.Map(document.getElementById('map2'), options2);

    marks = biggestEq


    loadEqLists(marks, '1');

    for(let i = 0; i < marks.length; i++){
        addMarkerEq(marks[i], map2, i)
    }

}

//UPDATE MAP1 AFTER A SUCCESFUL FORM SUBMISSION
async function updateMap(newMarks, lat, lng){
    if(newMarks.length == 0){
        
        var options = {
            zoom:7,
            center:{lat: lat, lng: lng}
        }

        var map = new google.maps.Map(document.getElementById('map1'), options);
        alertInfo('No earthquakes found in ' + placeName + ' try using zip code or another place.');
        return; // manejar aqui el error
    } else {

        if(zip != ''){
            history.push({placeName, zip, lat, lng});
            cityLocation = '';
            zip = '';
        }
        else{
            zip = 'Not available'
            history.push({placeName, zip,lat, lng});
            zip = '';
        }

        sessionStorage.setItem('historyArray', JSON.stringify(history));

        //refresh list of history
        refreshHistory();
        var options = {
            zoom:7,
            center:{lat: lat, lng: lng}
        }

        var map = new google.maps.Map(document.getElementById('map1'), options);

        //update list of eqs after search
        loadEqLists(newMarks, '0');

        for(let i = 0; i < newMarks.length; i++){
            addMarkerEq(newMarks[i], map, i);
        }
    }
}


// ADD MARKERS AND INFO WINDOW       
function addMarkerEq(mark, map, number){
    var marker = new google.maps.Marker({
        
        position: {lat: mark.lat, lng: mark.lng},
        map:map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+ (number + 1) +'|FE6256|000000'
    });

    const contentInfo = `
        <h3> Earthquake magnitude ${mark.magnitude} </h3>
        <p> Latitude ${mark.lat}</p>
        <p> Longitude ${mark.lng}</p>
    `

    var infoMarker = new google.maps.InfoWindow({
        content: contentInfo
    });

    marker.addListener("click", () => {
        infoMarker.open({
          anchor: marker,
          map,
          shouldFocus: true,
        });
      });
}


//fill eartquakes table info
async function loadEqLists(markers, table){
    let temp = document.getElementById('table-eq-' + table);
    temp.innerHTML = '';
    var html = ''
    for(let i = 0; i < markers.length; i++){
        html+=`
            <tr>
                <td> ${i+1} </td>
                <td> ${markers[i].magnitude} </td>
                <td> ${markers[i].datetime} </td>
            </tr>
        `
    }
    $('#table-eq-'+table).append(html);
    
    
}


//FUNCTION TO LOAD FROM SESSION STORAGE HISTORY
async function loadHistory() {
    var html = ''
    if(history.length != 0) {
        for(let i = 0; i < history.length; i++){
            html+=` 
                <tr>
                    <td> ${i+1} </td>
                    <td> ${history[i].placeName} </td>
                    <td> ${history[i].zip} </td>
                </tr>
            `
        }
        
    }
    else {
        html += `
            <tr> 
            </tr>
        `
    } 
    $('#history-table').append(html);
    
}

//FUNCTION TO REFRESH TABLE AFTER NEW SEARCH
async function refreshHistory(){
    let temp = document.getElementById('history-table');
    temp.innerHTML = '';
    var html = ''
    for(let i = 0; i < history.length; i++){
        html+=`
            <tr>
                <td> ${i+1} </td>
                <td> ${history[i].placeName} </td>
                <td> ${history[i].zip} </td>
            </tr>
        `
    }
    $('#history-table').append(html);
}




//enable disable zipCode textfield
$('#check-zip').on('click', function(){
    if(document.getElementById('check-zip').checked){
        document.getElementById('zipCode').disabled = false;
    }
        
    else{
        document.getElementById('zipCode').disabled = true;
        document.getElementById('zipCode').value = ''
    }
})


/***********  ALERT FUNCTIONS   *************/

function alertContent(message) {

    if($('#alert-form').hasClass('hidden')) {
        $('#alert-form').removeClass('hidden');
    }

    $('#alert-form').html('');    
    $('#alert-form').text(message);
}

function alertInfo(message) {
    if($('#alert-map').hasClass('hidden')) {
        $('#alert-map').removeClass('hidden');
    }

    $('#alert-map').html('');    
    $('#alert-map').text(message);
}



window.onload  = function(){
    loadHistory();
    //$(".loader").fadeOut();
    
}


document.head.appendChild(script);

/***********   BONUS       ***********/
// DUE TO THE LIMIT OF 1000 CREDITS BY USER; THE BONUS HAD TO BE REQUESTED BEFORE AND NOW IS A GLOBAL VARIABLE

//sort array BY MAGNITUDE
function orderEqs(prop){
    return function(a, b) {    
        if (a[prop] < b[prop]) {    
            return 1;    
        } else if (a[prop] > b[prop]) {    
            return -1;    
        }    
        return 0;    
    }  
}


//365 requests per each day, api does not allow date ranges
async function getLastYearEqs(){
    var date = new Date(2020, 9, 28);
    var temp = [];
    biggestEq = await getRecentEq2(date.toISOString().slice(0, 10));
    biggestEq = biggestEq.earthquakes;
    date.setDate(date.getDate() + 1);

    
    for(let i = 0; i < 364; i++) {
        temp = await getRecentEq2(date.toISOString().slice(0, 10));
        temp = temp.earthquakes;
        biggestEq = biggestEq.concat(temp);
        biggestEq.sort(orderEqs('magnitude'));
        biggestEq.splice(biggestEq.length -10 ,10); //DROP THE LAST 10 ELEMENTS AFTER SORT
        date.setDate(date.getDate() + 1); //ADD 1 DAY TO DATE
        console.log(biggestEq);
    }
    sessionStorage.setItem('bigEqs', JSON.stringify(biggestEq));
}



//get the earthquakes per date
async function getRecentEq2 (date){
    return new Promise((resolve, reject) => {
        $.ajax({
        
            url: 'http://api.geonames.org/earthquakesJSON?north=90&south=-90&east=180&west=-180&date=' + date + '&username=luisangeles99',
            method: 'GET',
            dataType: 'json',
            success: (data) =>{
                resolve(data);
            },
            error: (error) =>{
                console.log('error' + error);
                reject(error);
                
            }
        });
    })
    
}

//result after running the functions.
let biggestEq = [{"datetime": "2021-07-29 06:23:56",
"depth": 32.2,
"eqid": "ak0219neiszm",
"lat": 55.3248,
"lng": -157.8414,
"magnitude": 8.2,
"src": "ak"},
{"datetime": "2021-03-04 19:40:50",
"depth": 19.4,
"eqid": "us7000dflf",
"lat": -29.7399,
"lng": -177.2672,
"magnitude": 8.1,
"src": "us"},
{"datetime": "2021-08-12 18:51:29",
"depth": 55.73,
"eqid": "us6000f53e",
"lat": -58.4513,
"lng": -25.327,
"magnitude": 8.1,
"src": "us"},
{"datetime": "2021-02-10 13:22:20",
"depth": 10,
"eqid": "us6000dg77",
"lat": -23.2507,
"lng": 171.4851,
"magnitude": 7.7,
"src": "us"},
{"datetime": "2021-08-12 18:40:54",
"depth": 63.25,
"eqid": "us6000f4ly",
"lat": -57.5959,
"lng": -25.1874,
"magnitude": 7.5,
"src": "us"},
{"datetime": "2021-03-04 17:51:15",
"depth": 55.57,
"eqid": "us7000dfk3",
"lat": -29.6131,
"lng": -177.8425,
"magnitude": 7.4,
"src": "us"},
{"datetime": "2021-03-04 13:34:44",
"depth": 20.78,
"eqid": "us7000dffl",
"lat": -37.5628,
"lng": 179.4443,
"magnitude": 7.3,
"src": "us"},
{"datetime": "2021-05-21 18:15:15",
"depth": 10,
"eqid": "us7000e54r",
"lat": 34.5864,
"lng": 98.2548,
"magnitude": 7.3,
"src": "us"},
{"datetime": "2021-10-02 06:43:05",
"depth": 535.79,
"eqid": "us6000fr0b",
"lat": -21.1036,
"lng": 174.8945,
"magnitude": 7.3,
"src": "us"},
{"datetime": "2021-10-02 06:43:05",
"depth": 535.79,
"eqid": "us6000fr0b",
"lat": -21.1036,
"lng": 174.8945,
"magnitude": 7.3,
"src": "us"}];