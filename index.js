'use strict';
const geoURL = 'https://api.opencagedata.com/geocode/v1/json';
const geoKey = 'c8fa9af0ebcb4c5daa2bbcd38c5f5bd2';

const searchURL = 'https://www.hikingproject.com/data/get-trails';
const apiKey = '200650145-102d40953dcd593ca8cd47bf5ba24ff1';

const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const appId = 'ae76d0efed32d9f29c4d54a5738b80ca';

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
  const url = weatherUrl + '?' + queryString;
    
  console.log(url, {mode: 'no-cors'});

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
      `<li id='js-result_2'>
      <div><img src="NotFound.png" class="result-img"></div>
      </li>`
    )
  });
};

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function getTrails(responseJson) {
  console.log(responseJson);

  const lat = responseJson.results[0].geometry.lat;
  const lng = responseJson.results[0].geometry.lng;
  console.log(lat,lng);

  const params = {   
    lat: lat,
    lon: lng,
    maxDistance: 15,
    key: apiKey,
    };

  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString;

  console.log(url, {mode: 'no-cors'});

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
      //hide previous results and display 404 Not found
      $('#results').addClass('hidden')
      $('#js-error-message').append(
        `<li id='js-result_2'>
      <div><img src="NotFound.png" class="result-img"></div>
      </li>`
      );
    });
}

function getGeo(searchTerm) {
    const params = {
        key: geoKey,
        q: searchTerm,
        pretty: 1,
        no_annotations: 1
      };

    const queryString = formatQueryParams(params)
    const url = geoURL + '?' + queryString;
    
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
          `<li id='js-result_2'>
      <div><img src="NotFound.png" class="result-img"></div>
      </li>`
        );
    });

};

function displayWeather(responseJson_3) {
    console.log(responseJson_3);

    // remove previous results
    $('#js-error-message').empty();
    $('#js-weather').empty();

    const city = responseJson_3.name;
    const temp = Math.floor(responseJson_3.main.temp) + "°" + "F";
    const humidity = 'at ' + responseJson_3.main.humidity + '%';
    const summary = responseJson_3.weather[0].description;
    const weatherIcon = "https://api.openweathermap.org/img/w/" + responseJson_3.weather[0].icon + ".png";

    
    $('#js-weather').append(
        `<li class="box-info"><h3 id="js-city-name">${city}</h3>
        <p>Temperature at<span> ${temp}</span></p>
        <p class="weather-icon"><img src="${weatherIcon}" alt="weather icon"/></p>
        <p>Conditions: <span> ${summary}</span></p>
        <p>Humidity<span> ${humidity}</span></p>
        </li>`
    ); 
}

function displayResults(responseJson_2) {
    console.log(responseJson_2);
    const trails = responseJson_2.trails;
  
    // remove previous results
    $('#js-error-message').empty();
    $('#results-list').empty();
  
    //throw 404 if result not found
    if (trails.length === 0) {
      $('#results-list').append(
        `<li id='js-result_2'>
        <div class="image-wrap"><img src="NotFound.png" class="result-img"></div>
        </li>`
      )
    } else {
      // iterate through the length of the repos array
      for (let i = 0; i < trails.length; i++){
        // add a list item to the results 
      //list parks info
      $('#results-list').append(
        `<li><h3 id="js-name">${trails[i].name}</h3>
        <p><div class= "scale-img"><a target="_blank" href="${trails[i].imgMedium}"><img class="trail-img" src="${trails[i].imgSmallMed}" alt="trail photo"/></a></div></p>
        <p>Exact Location:<span>${trails[i].location}</span></p>
        <p>Difficulty:<span>${trails[i].difficulty}, learn more </span><a target="_blank" href="https://signsofthemountains.com/blogs/news/what-do-the-symbols-on-ski-trail-signs-mean">here</a></p>
        <p>Description:<span>${trails[i].summary}</span></p>
        <p>Condition Status:<span>${(trails[i].conditionDetails !== null)? trails[i].conditionDetails : "not available"}</span></p>
        <p>Length:<span>${trails[i].length} miles</span></p>
        <p>Descent:<span>${trails[i].descent} ft.</span></p>
        <p>Reviews:<span>${trails[i].stars}/5</span></p>
        <p>Homepage:<span> For more information </span><a target="_blank" href="${trails[i].url}">visit our website</a></p>
        <hr>
        </li>`)
      }  
    };
  
    //display the results section  
    $('#results').removeClass('hidden');
  }

  
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    // getTrails(maxDistance);
    getGeo(searchTerm);   
  });

  $(window).on('scroll', function() {
    if ($(window).scrollTop() > $('body').height() / 2) {
    $('.logo-search').removeClass('hidden');
    $('#js-footer').removeClass('hidden');
    }
    else if ($('#js-top').focus()){
    $('.logo-search').addClass('hidden');
    }
});
}

$(watchForm);