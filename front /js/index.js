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


//BONUS Show 12 last biggest EQ
async function getRecentEq (){
    return new Promise((resolve, reject) => {
        $.ajax({
        
            url: 'http://api.geonames.org/earthquakesJSON?north=90&south=-90&east=180&west=-180&username=luisangeles99',
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

//MAPS Generated
async function initMap (markers){
    var options1 = {
        zoom:7,
        center:{lat: 25.686613, lng:-100.316116}
    }

    var options2 = {
        zoom:2,
        center:{lat: 0, lng:0}
    }

    //First map will display an example city
    var map = new google.maps.Map(document.getElementById('map1'), options1);

    if(markers !== undefined) {
        for(let i = 0; i < markers.length; i++) {
            addMarkerEq(markers[i], map, i)
        }
    }

    var marker = new google.maps.Marker({
        position: {lat: 25.686613, lng: -100.316116},
        map:map
    });

    var map2 = new google.maps.Map(document.getElementById('map2'), options2);

    markers2 = [
        {lat: 10, lng:20},
        {lat: 50, lng:10}
    ]

    marks = await getRecentEq();
    
    if (!marks) {
        marks = markers2;
    } else{
        marks = marks.earthquakes
    }

    loadEqLists(marks, '1');

    for(let i = 0; i < marks.length; i++){
        addMarkerEq(marks[i], map2, i)
    }

}

async function updateMap(newMarks, lat, lng){
    if(newMarks.length == 0){
        
        var options = {
            zoom:7,
            center:{lat: lat, lng: lng}
        }

        var map = new google.maps.Map(document.getElementById('map1'), options);
        alertInfo('No earthquakes found in ' + placeName + 'try using zip code or another place.');
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
        var aux = JSON.parse(sessionStorage.getItem('historyArray'));
        console.log(aux);

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


//funcion de marcadores         
function addMarkerEq(mark, map, number){
    var marker = new google.maps.Marker({
        
        position: {lat: mark.lat, lng: mark.lng},
        map:map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+ (number + 1) +'|FE6256|000000'
    });

    const contentInfo = `
        <h3> Terremoto de magnitud ${mark.magnitude} </h3>
        <p> Latitud ${mark.lat}</p>
        <p> Latitud ${mark.lng}</p>
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
}


document.head.appendChild(script);
