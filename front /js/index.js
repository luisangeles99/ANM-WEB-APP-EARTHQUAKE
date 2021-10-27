//Google API MAPS
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAFeeqkNFImG6cXYX41JVkd4yCsa4e_3f4&callback=initMap';
script.async = true;

//local history
let history = [];
let placeName = '';


//city 
$('#search').on('click', async function(){
    let cityLocation = $('#cityName').val();
    
    if(!cityLocation) {
        alert('Campo ciudad vacío');
        return
    }
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'http://api.geonames.org/postalCodeSearchJSON?placename=' + cityLocation + '&username=luisangeles99',
            method: 'GET',
            dataType: 'json',
            success: function(data){
                
                if(data.postalCodes.length == 0) {
                    alert('Prueba con otro lugar');
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
    })
    

    

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
        
            url: 'http://api.geonames.org/earthquakesJSON?north=90&south=-90&east=180&west=-180&username=luisangeles99&date=2021-10-26',
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
            addMarkerEq(markers[i], map)
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
    console.log(marks)
    
    if (!marks) {
        marks = markers2;
    } else{
        marks = marks.earthquakes
    }

    for(let i = 0; i < marks.length; i++){
        addMarkerEq(marks[i], map2)
    }

}

async function updateMap(newMarks, lat, lng){
    if(newMarks.length == 0){
        alert('Sin terremotos')
        var options = {
            zoom:7,
            center:{lat: lat, lng: lng}
        }

        var map = new google.maps.Map(document.getElementById('map1'), options);
        return; // manejar aqui el error
    } else {
        history.push({placeName, lat, lng});
        console.log(history);
        var options = {
            zoom:7,
            center:{lat: lat, lng: lng}
        }

        var map = new google.maps.Map(document.getElementById('map1'), options);

        for(let i = 0; i < newMarks.length; i++){
            addMarkerEq(newMarks[i], map);
        }
    }
}


//funcion de marcadores         
function addMarkerEq(mark, map){

    var marker = new google.maps.Marker({
        position: {lat: mark.lat, lng: mark.lng},
        map:map
    });
}




document.head.appendChild(script);
