//global variables
var border;
// asignamos el div con el id="map" a la propiedad map del objeto "L". L viene de "Leaflet"
var map = L.map('map').fitWorld();
// Markers cluster for a better handling
var myMarkers = new L.featureGroup().addTo(map);


// asignamos maptiler como nuestra gradilla 
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=ytVhVPQvmg9nn3rYyj1s', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    crossOrigin: true
}).addTo(map)

// A more programatically way to build the countries <select> list
$.ajax({
	url: "../gazetteer/php/geoJson.php",
	type: 'POST',
	dataType: "json",
	
	success: function(result) {
		console.log('populate options' , result);
        if (result.status.name == "ok") {
            for (var i=0; i<result.data.border.features.length; i++) {
                        $('#selCountry').append($('<option>', {
                            value: result.data.border.features[i].properties.iso_a3,
                            text: result.data.border.features[i].properties.name,
                        }));
                    }
                }
            //sort options alphabetically
            $("#selCountry").html($("#selCountry option").sort(function (a, b) {
                return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
            }))
        }
      });

// Locating user's device and getting info from openCage API
const successCallback = (position) => {
  $.ajax({
      url: "../gazetteer/php/openCage.php",
      type: 'GET',
      dataType: 'json',
      data: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
      },

      success: function(result) {
          console.log('openCage PHP',result);
          currentLat = result.data[0].geometry.lat;
          currentLng = result.data[0].geometry.lng;

          L.marker([currentLat, currentLng]).addTo(map).bindPopup("You are in: <br><br><br>" + result.data[0].components.postcode + "<br><br>" +
                                                                                              result.data[0].components.suburb + " suburb <br><br>" +
                                                                                              result.data[0].components.town + " town <br><br>" +
                                                                                              result.data[0].components.state + " state <br><br>" +
                                                                                              result.data[0].components.country + " <br><br>" 
                                                                                        );

          $("selectOpt select").val(result.data[0].components["ISO_3166-1_alpha-3"]);
          
          let currentCountry = result.data[0].components["ISO_3166-1_alpha-3"];
          $("#selCountry").val(currentCountry).change();
          
      
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
      }
  }); 
  }

  const errorCallback = (error) => {
          console.error(error);
}
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);


// adding borders to our map

$('#selCountry').on('change', function() {
  let countryCode = $('#selCountry').val();
  let countryOptionText= $('#selCountry').find('option:selected').text();
  
  //default to home tab
  const showFirstTab = function () {
         $('#nav-home-tab').tab('show');
       }
  showFirstTab();

  $.ajax({
    url: "../gazetteer/php/geoJson.php",
    type: 'POST',
    dataType: 'json',
    success: function(result) {

      console.log('all borders result', result);

      if (map.hasLayer(border)) {
        map.removeLayer(border);
            }

            let countryArray = [];
            let countryOptionTextArray = [];

            for (let i = 0; i < result.data.border.features.length; i++) {
                 if (result.data.border.features[i].properties.iso_a3 === countryCode) {
                    countryArray.push(result.data.border.features[i]);
                }
            };

            for (let i = 0; i < result.data.border.features.length; i++) {
                if (result.data.border.features[i].properties.name === countryOptionText) {
                   countryOptionTextArray.push(result.data.border.features[i]);
               }
            };

            console.log('country array', countryArray);

            console.log('Odd Array', countryOptionTextArray)

            border = L.geoJSON(countryOptionTextArray[0], {
                                                            color: '#ff7800',
                                                            weight: 2,
                                                            opacity: 0.65
                                                          }).addTo(map);

            let bounds = border.getBounds();
                    map.flyToBounds(bounds, {
                    padding: [0, 35], 
                    duration: 2
                });
              
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(textStatus, errorThrown);
    }
  }); 
});




  /*
  
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


*/



// paddy -->>  When clicking in a country fire same thing than when using the select
