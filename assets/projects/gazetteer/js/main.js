//global variables
// asignamos el div con el id="map" a la propiedad map del objeto "L". L viene de "Leaflet"
var map = L.map('map')
// Markers cluster for a better handling
var myMarkers = new L.featureGroup().addTo(map);


// asignamos maptiler como nuestra gradilla 
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=ytVhVPQvmg9nn3rYyj1s', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    crossOrigin: true
}).addTo(map)

let countries; // will contain "fetched" data
const countriesList = document.getElementById("countries");


fetch("https://restcountries.eu/rest/v2/all")
.then(res => res.json())
.then(data => initialize(data))
.catch(err => console.log("Error:", err));

function initialize(countriesData) {
  countries = countriesData;
  console.log(countriesData);
  let options = "";
  countries.forEach(country => options+=`<option value="${country.alpha2Code}">${country.name}</option>`);
  countriesList.innerHTML = options;
  //countriesList.selectedIndex = Math.floor(Math.random()*countriesList.length); //  --- Instead of this go straight to my country

  var success = function(position){

    var latitud = position.coords.latitude,
        longitud = position.coords.longitude;

    //console.log(latitud, longitud)
    $("#selLat").val(latitud);
    $("#selLng").val(longitud);
    
    var dataToSend = {
      lat: $("#selLat").val(),
      lng: $("#selLng").val(),
    };
    // Here starts our asynchronous JavaScript code, but instead of XML we are using JSON
    $.ajax({
      // Parameters
      url: "../gazetteer/php/functions.php",
      type: "POST",
      dataType: "json",
      data: dataToSend,
      // In case of success
      success: function (result) {

        $('#countries').val(result.data[0].countryCode).change();
        console.log(result.data[0].countryCode)
        displayCountryInfo(countriesList[countriesList.selectedIndex].value);
        
      },
      // In case of error
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown);
      },
    
    });

}
navigator.geolocation.getCurrentPosition(success, function(msg){

    console.error( msg );

});
  
}

function displayCountryInfo(countryByAlpha2Code) {
  
  const countryData = countries.find(country => country.alpha2Code === countryByAlpha2Code);
  
  map.setView(countryData.latlng, 5);
  
  //L.marker(countryData.latlng).addTo(map).bindPopup(`
  L.marker(countryData.latlng).addTo(myMarkers).bindPopup(`

                <p>
                  <div id="flag-container">
                    <img src="${countryData.flag}" alt="">
                  </div>
                </p><br><br><br>
                <p>Country: ${countryData.name}
                <p>Capital: ${countryData.capital}
                </p><p>Dialing Code: +${countryData.callingCodes[0]}
                </p><p>Population: ${countryData.population}
                </p><p>Currencies: ${countryData.currencies.filter(c => c.name).map(c => `${c.name} (${c.code})`).join(", ")}
                </p><p>Region: ${countryData.region}</p><p>Subregion: ${countryData.subregion}</p>
            `);  

}

countriesList.addEventListener("change", newCountrySelection);

function newCountrySelection(event) {

    displayCountryInfo(event.target.value);

  }

$('#clear_markers').click(function () {
    myMarkers.eachLayer(function (layer) {
    
      myMarkers.removeLayer(layer);
    
    });
});




// paddy -->>  When clicking in a country fire same thing than when using the select
