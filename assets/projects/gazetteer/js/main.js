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
        //map.removeLayer(border);
      }
          console.log(result.data.border.features)
          let countryArray = [];
          let countryOptionTextArray = [];
          let fullCountryArray = [];
          
          for (let i = 0; i < result.data.border.features.length; i++) {
            fullCountryArray.push(result.data.border.features[i])
            
          }
          for (let i = 0; i < fullCountryArray.length; i++) {

            L.geoJSON(fullCountryArray[i], {
              color: '#ff2176',
              weight: 2,
              opacity: 0.25
            }).addTo(map);
          }

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
                                                          color: 'lime',
                                                          weight: 3,
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

// fetching info from rest countries API
$('#btnRun').click(function() {
  $.ajax({
      url: "../gazetteer/php/restCountries.php",
      type: 'POST',
      dataType: 'json',
      data: {
          country: $('#selCountry').val()   
      },
      success: function(result) {
          
          console.log('restCountries', result);
          if (result.status.name == "ok") {
              currencyCode = result.currency.code;
              capitalCityWeather= result.data.capital.toLowerCase();
              iso2CountryCode = result.data.alpha2Code;
              var countryName2 = result.data.name;
              countryName = countryName2.replace(/\s+/g, '_');
              
              $('#txtName').html(result['data']['name']+ '<br>');
              $('#txtCurrency').html('Currency: ' + result.currency.name + '<br>');
              $('#txtCurrencyCode').html('Currency Code: ' + result.currency.code + '<br>');
          
      //wikipedia country extracts
              $.ajax({
                  url:'https://en.wikipedia.org/api/rest_v1/page/summary/' + countryName,
                  type: 'GET',
                  dataType: 'json',
                  success: function(result) {
                    console.log('wiki info', result);
                    $('#txtWikiImg').html('<img src=' + result.thumbnail.source +'><br>');
                    $('#txtWiki').html('Wikipedia: ' + result.extract_html +'<br>');
                  },
        
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });
      //Geonames Country Info
              $.ajax({
                  url: "../gazetteer/php/getCountryInfo.php",
                  type: 'GET',
                  dataType: 'json',
                  data: {
                      geonamesInfo: iso2CountryCode,
                  },
                  success: function(result) {
                      console.log('Geonames Data', result);
                      if (result.status.name == "ok") {
                        $('#txtCapital').html('Capital: '+result.data[0].capital+ '<br>');
                        $('#txtCapital2').html('<strong>' + result.data[0].capital+ '\'\s Weather</strong><br>');
                        $('#txtAreaInSqKm').html('Area in Sq Km: '+result.data[0].areaInSqKm+ '<br>');
                        $('#txtContinent').html('Continent: '+result.data[0].continent+ '<br>');
                        $('#txtPopulation').html('Population: '+result.data[0].population+ '<br>');
                        $('#txtLanguages').html('Languages: '+ result.data[0].languages + '<br>');
                      }
                    },
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });
      
              //News API
              $.ajax({
                  url: "../gazetteer/php/news.php",
                  type: 'GET',
                  dataType: 'json',
                  data: {
                      newsCountry: iso2CountryCode,
                  },
                  success: function(result) {
                      console.log('News Data', result);
                      if (result.status == "No matches for your search.") {
                          $('#txtHeadlineTitle').hide();
                          $('#newsList').hide();
                          $('#noNews').html('Sorry, the Newscatcher API does not have articles for this country.');
                      }
                      else if (result.status == "ok") {
                          $('#newsList').html("");
                          for (var i=0; i<result.articles.length; i++) {
                              $("#newsList").append('<li><a href='+ result.articles[i].link + '>' + result.articles[i].title + '</a></li>');
                      }                
                  }},
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              }); 

              //Covid info
              $.ajax({
                  url: "../gazetteer/php/covid.php",
                  type: 'GET',
                  dataType: 'json',
                  data: {
                      covidCountry: iso2CountryCode,
                  },
                  success: function(result) {
                      console.log('Covid Data',result.covidData);
                      
                      
                      if (result.status.name == "ok") {
                          $('#txtCovidDeaths').html('Deaths: ' + result.covidData.deaths + '<br>');
                          $('#txtCovidCases').html('Cases: ' + result.covidData.confirmed + '<br>');
                          $('#txtCovidRecovered').html('Recoveries: ' + result.covidData.recovered + '<br>');
                          $('#txtCovidCritical').html('Critical Patients: ' + result.covidData.critical + '<br>');
                          $('#txtCovidDeathRate').html('Death rate: ' + result.covidData.calculated.death_rate + '<br>');


                          
                      }
                  
                  },
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });  

              // Exchange Rates
              $.ajax({
                  url: "../gazetteer/php/exchangeRates.php",
                  type: 'GET',
                  dataType: 'json',
                  success: function(result) {
                      console.log('exchange rates',result);
                      if (result.status.name == "ok") {
                      
                      exchangeRate = result.exchangeRate.rates[currencyCode];
                      $('#txtRate').html('Current Exchange Rate: ' + exchangeRate + ' ' + currencyCode + ' to 1 USD. <br>');
                      }
                  },
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });  
              //openWeather API          
              $.ajax({
                  url: "../gazetteer/php/openWeatherCurrent.php",
                  type: 'POST',
                  dataType: 'json',
                  data: {
                      capital: capitalCityWeather,
                  }, 
                  success: function(result) {
                      console.log('CurrentCapitalWeather', result);
                      capitalCityLat = result.weatherData.coord.lat;
                      capitalCityLon = result.weatherData.coord.lon;
                      
                      if (result.status.name == "ok") {
          
                          $('#txtCapitalWeatherCurrent').html('&nbsp;&nbsp;&nbsp;&nbsp;Today\'s Weather: '+ result.weatherData.weather[0].description +' with temp of ' + result.weatherData.main.temp +'&#8451<br>');
                          $('#txtCapitalWeatherLo').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Today\'\s Low: ' + result.weatherData.main.temp_min +'&#8451<br>');
                          $('#txtCapitalWeatherHi').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Today\'\s High: ' + result.weatherData.main.temp_max +'&#8451<br>');
                          
                          //forcast API
                          $.ajax({
                              url: "../gazetteer/php/openWeatherForcast.php",
                              type: 'GET',
                              dataType: 'json',
                              data: {
                                  lat: capitalCityLat,
                                  lng: capitalCityLon
                              },
                              success: function(result) {
                                  
                                  console.log('Weather Forecast',result);
                                  
                                  if (result.status.name == "ok") {
                                        
                                        $('#txtCapitalWeatherForcast').html('&nbsp;&nbsp;&nbsp;&nbsp;Tomorrow\'s\ Weather: ' + result.weatherForcast.daily[1].weather[0].description +' with high of ' + result.weatherForcast.daily[1].temp.max +'&#8451 and low of ' + result.weatherForcast.daily[1].temp.min +'&#8451.<br>');
                                        $('#txtCapitalWeatherFHi').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tomorrow\'s\ High: ' + result.weatherForcast.daily[1].temp.max + '&#8451<br>')
                                        $('#txtCapitalWeatherFLo').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tomorrow\'s\ Low: ' + result.weatherForcast.daily[1].temp.min + '&#8451<br>')
                                  }
                              },
                              error: function(jqXHR, textStatus, errorThrown) {
                                  console.log(textStatus, errorThrown);
                              }
                          });
                          
                          // wiki places of interest
                          $.ajax({
                              url: "../gazetteer/php/wikiPlaces.php",
                              type: 'GET',
                              dataType: 'json',
                              data: {
                                  lat: capitalCityLat,
                                  lng: capitalCityLon
                              },
                              success: function(result) {
                                  console.log('wikiPlaces Data',result);
                                  $('#wikiPlaces').html("");
                                  if (result.status.name == "ok") {
                                      for (var i=0; i<result.wikiPlaces.length; i++) {
                                          $("#wikiPlaces").append('<li><a href=https://'+result.wikiPlaces[i].wikipediaUrl+'>'+ result.wikiPlaces[i].title +'</a></li>'+
                                          result.wikiPlaces[i].summary + '<br>' 
                                          )}
                                          }
                              
                              },
                              error: function(jqXHR, textStatus, errorThrown) {
                                  console.log(textStatus, errorThrown);
                              }
                          });
                      }
                  },
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });              
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
      }  
  }); 
});


