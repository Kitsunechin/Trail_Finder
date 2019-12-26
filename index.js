'use strict';
const geoURL = 'https://api.opencagedata.com/geocode/v1/json';
const geoKey = 'c8fa9af0ebcb4c5daa2bbcd38c5f5bd2';

const searchURL = 'https://www.hikingproject.com/data/get-trails';
const apiKey = '200650145-102d40953dcd593ca8cd47bf5ba24ff1';

const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const appId = 'ae76d0efed32d9f29c4d54a5738b80ca';

//function to format search params
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
};

//pass the search term and call in reverse geo API to get lat&lng
function getGeo(searchTerm) {
    const params = {
        key: geoKey,
        q: searchTerm,
        pretty: 1,
        no_annotations: 1
      };

    const queryString = formatQueryParams(params)
    const url = `${geoURL}?${queryString}`;
    
    console.log(url);
    
    fetch(url)
    .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        getTrails(responseJson);
        getWeather(responseJson);
    })
    .catch(err => {
        console.log(err.message);
        //hide previous results and display Not found
        $('#results').addClass('hidden')
        $('#js-error-message').append(
          `<li id="js-result_2">
          <div><img src="Assets/NotFound.png" class="result-img"></div>
          </li>`
        );
    });

};

//pass the lat&lng to get the waether info on the searched location
function getWeather(responseJson) {
  const lat = responseJson.results[0].geometry.lat;
  const lng = responseJson.results[0].geometry.lng;
  const city = responseJson.results[0].components.city;

  const params = {   
    city: city,
    lat: lat,
    lon: lng,
    appId: appId,
    units: 'imperial'
        };
    
  const queryString = formatQueryParams(params)
  const url = `${weatherUrl}?${queryString}`;
    
  console.log(url);

  fetch(url)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson_3 => {
    displayWeather(responseJson_3);
    })
  .catch(err => {
    console.log(err.message);
    //hide previous results and display 404 Not found
    $('#results').addClass('hidden')
    $('#js-error-message').append(
      `<li id="js-result_2">
      <div><img src="Assets/NotFound.png" class="result-img"></div>
      </li>`
    )
  });
};

//pass the lat&lng to get the info on the trails in the area
function getTrails(responseJson) {
  console.log(responseJson);

  const lat = responseJson.results[0].geometry.lat;
  const lng = responseJson.results[0].geometry.lng;
  console.log(lat,lng);

  const params = {   
    lat: lat,
    lon: lng,
    maxDistance: 15, //limit the result to 15miles
    key: apiKey,
    };

  const queryString = formatQueryParams(params)
  const url = `${searchURL}?${queryString}`;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson_2 => displayResults(responseJson_2))
    .catch(err => {
      console.log(err.message);
      //hide previous results and display if Not found
      $('#results').addClass('hidden')
      $('#js-error-message').append(
        `<li id="js-result_2">
      <div><img src="Assets/NotFound.png" class="result-img"></div>
      </li>`
      );
    });
};

//display the data for the weather
function displayWeather(responseJson_3) {
    console.log(responseJson_3);

    // remove previous results
    $('#js-error-message').empty();
    $('#js-weather').empty();
    $(window).on('scroll', function() {
      if ($('#results').focus()) {
      $('.logo-search').removeClass('hidden');
      $('#js-footer').removeClass('hidden');
    }
      else if ($('#js-top').focus()){
      $('.logo-search').addClass('hidden');
    }
    });

    const city = `${responseJson_3.name}`;
    const temp = `${Math.floor(responseJson_3.main.temp)}° F`;
    const humidity = `at ${responseJson_3.main.humidity}%`;
    const summary = `${responseJson_3.weather[0].description}`;
    const weatherIcon = `https://api.openweathermap.org/img/w/${responseJson_3.weather[0].icon}.png`;

    
    $('#js-weather').append(
        `<li class="box-info"><h3 id="js-city-name">${city}</h3>
        <p>Temperature at<span> ${temp}</span></p>
        <p class="weather-icon"><img src="${weatherIcon}" alt="weather icon"/></p>
        <p>Conditions: <span> ${summary}</span></p>
        <p>Humidity<span> ${humidity}</span></p>
        </li>`
    ); 
};

//display the data for the trails
function displayResults(responseJson_2) {
    console.log(responseJson_2);
    const trails = responseJson_2.trails;
  
    // remove previous results
    $('#js-error-message').empty();
    $('#results-list').empty();
    $('.js-number').text(`We've found ${trails.length} results for this search`);
  
    //throw Not Found if result not found
    if (trails.length === 0) {
      $('#results-list').append(
        `<li id="js-result_2">
        <div class="image-wrap"><img src="Assets/NotFound.png" class="result-img"></div>
        </li>`
      )
    } else {
      // iterate through the length of the repos array
      for (let i = 0; i < trails.length; i++){
      // add a list of items to the results 
      // handle broken empty img
    
      //list parks info
      $('#results-list').append(
        `<li><h3 id="js-name">${trails[i].name}</h3>
        <p class="style-label"><div class= "scale-img"><a target="_blank" href="${trails[i].imgMedium}"><img class="trail-img" src="${trails[i].imgSmallMed}" alt="trail photo"/></a></div></p>
        <p class="style-label">Exact Location:<span>${trails[i].location}</span></p>
        <p class="style-label">Difficulty:<span>${trails[i].difficulty}, learn more <a target="_blank" href="https://signsofthemountains.com/blogs/news/what-do-the-symbols-on-ski-trail-signs-mean">here <img class= "external-link" src="Assets/external.png" alt="icon" width="12px"/></a></span></p>
        <p class="style-label">Description:<span>${trails[i].summary}</span></p>
        <p class="style-label">Condition Status:<span>${(trails[i].conditionDetails !== null)? trails[i].conditionDetails : "not available"}</span></p>
        <p class="style-label">Length:<span>${trails[i].length} miles</span></p>
        <p class="style-label">Descent:<span>${trails[i].descent} ft.</span></p>
        <p class="style-label">Reviews:<span>${trails[i].stars}/5</span></p>
        <p class="style-label">Homepage:<span> For more information <a target="_blank" href="${trails[i].url}">visit this website <img class= "external-link" src="Assets/external.png" alt="icon" width="12px"/></a></span></p>
        <hr>
        </li>`)
      }  
    };
  
    //disable link and img if the attributes in API are empty 
    $('img').each(function () {
      if($(this).attr('src')=="") {
         $(this).attr('src', 'Assets/noImg.png').css({'width' : '250px' , 'height' : 'auto'});
      }
    });

    $('a').each(function () {
      if($(this).attr('href')=="") {
         $(this).attr('href', '#0').click(function(event) {
          event.preventDefault();})
      }
    });
    
    //display the results section  
    $('#results').removeClass('hidden');
};

function adjustPlace() {
  $("input[placeholder]").each(function () {
    $(this).attr('size', $(this).attr('placeholder').length);
  });
}

//watch the form for user action
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    adjustPlace();
    const searchTerm = $('#search-term').val();
    getGeo(searchTerm);   
  });
};

$(watchForm);