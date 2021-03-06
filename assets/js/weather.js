
//Retrieve weather search history from localStorage
//Will be stored as lower case strings of city names
var savedWeatherSearches = JSON.parse(localStorage.getItem("savedWeatherSearches")) || [];
var placeholderCities = [
    { cityName: "houston", longitude: -95.3633, latitude: 29.7633 },
    { cityName: "san diego", longitude: -117.1753, latitude: 32.7153 },
    {
        "cityName": "boston",
        "longitude": -71.0598,
        "latitude": 42.3584
    },
    {
        "cityName": "philadelphia",
        "longitude": -75.1638,
        "latitude": 39.9523
    },
    {
        "cityName": "new york city",
        "longitude": -74.006,
        "latitude": 40.7143
    },
    {
        "cityName": "denver",
        "longitude": -104.9847,
        "latitude": 39.7392
    },
    {
        "cityName": "san francisco",
        "longitude": -122.4194,
        "latitude": 37.7749
    }
];
var mostRecentSearch = savedWeatherSearches.length === 0 ? placeholderCities[Math.floor(Math.random()*placeholderCities.length)] : savedWeatherSearches[0];



var saveSearches = function() {
    localStorage.setItem("savedWeatherSearches",JSON.stringify(savedWeatherSearches));
};

var jumpToTheFront = function(inputArray,index) {
    if(inputArray.length === 1) {
        return inputArray;
    }
    var newNo1 = inputArray[index];
    var output = [newNo1];
    for(var i = 0; i < inputArray.length; i++) {
        if(i !== index) {
            output.push(inputArray[i]);
        }
    }
    return output;
};

var addClassToElement = function(element,classToAdd) {
    element.classList.add(classToAdd);
};

//API ID
var apiId = "b30096dc99b5b0d5c4edfccb15cd2965";

//Page elements
var citySearchEl = document.querySelector("#city-search");
var cityFormEl = document.querySelector("#city-form");
var prevSearches = document.querySelector("#previous-searches");
var currentCityEl1 = document.querySelector("#current-city-today");
var currentCityEl2 = document.querySelector("#current-city-five-day");
var clearSearchBtn = document.querySelector("#clearSearchHistory");

//Captialize first letters of words
var titlize = function(inputString) {
    var stringArray = inputString.split(" ");
    var newStrings = [];
    for(var i = 0; i < stringArray.length; i++) {
        newStrings.push(stringArray[i].charAt(0).toUpperCase() + stringArray[i].slice(1).toLowerCase());
    }
    return newStrings.join(" ");
};

var getTodaysWeather = function(cityName,dayData) {
    var todaysWeatherDiv = document.createElement("div");
    var cityHeader = document.createElement("h2");
    var cityAndDay = titlize(cityName) + " (" + moment(dayData.dt*1000).format("MM/D/YYYY") + ")";
    if(cityName === "philadelphia") {
        cityAndDay += " <img src='http://openweathermap.org/img/wn/01d.png' />";
    } else {
        cityAndDay += " <img src='http://openweathermap.org/img/wn/" + dayData.weather[0].icon + ".png' />";
    }
    cityHeader.innerHTML = cityAndDay;
    var tempDiv = document.createElement("div");
    addClassToElement(tempDiv,"mb-4");
    addClassToElement(tempDiv,"fontSize20");
    var maxTemp = (dayData.temp - 273.15)*1.8 + 32;
    tempDiv.innerHTML = "Temp: " + maxTemp.toFixed(2) + " &deg;F";
    var windDiv = document.createElement("div");
    addClassToElement(windDiv,"mb-4");
    addClassToElement(windDiv,"fontSize20");
    windDiv.textContent = "Wind: " + dayData.wind_speed + " MPH";
    var humidityDiv = document.createElement("div");
    addClassToElement(humidityDiv,"mb-4");
    addClassToElement(humidityDiv,"fontSize20");
    humidityDiv.textContent = "Humidity: " + dayData.humidity + "%";
    var uvDiv = document.createElement("div");
    addClassToElement(uvDiv,"mb-4");
    addClassToElement(uvDiv,"fontSize20");
    var uvSpan = "<span class='";
    var uvi = dayData.uvi;
    if(uvi < 3) {
        uvSpan += "bgLow";
    } else if(uvi < 6) {
        uvSpan += "bgModerate";
    } else if(uvi < 8) {
        uvSpan += "bgHigh";
    } else if(uvi < 11) {
        uvSpan += "bgVeryHigh";
    } else {
        uvSpan += "bgExtreme";
    }
    uvSpan += "'>" + uvi + "</span>";
    uvDiv.innerHTML = "UV Index: " + uvSpan;
    todaysWeatherDiv.append(cityHeader,tempDiv,windDiv,humidityDiv,uvDiv);
    currentCityEl1.innerHTML = "";
    currentCityEl1.appendChild(todaysWeatherDiv);
};

var getDailyForecast = function(dayData,cityName) {
    var dayDiv = document.createElement("div");
    dayDiv.className = "flex-column col-2 forecast5";
    var dayHeader = document.createElement("h4");
    addClassToElement(dayHeader,"mb-3");
    dayHeader.textContent = moment(dayData.dt*1000).format("MM/D/YYYY");
    //Some sort of weather symbol?
    var conditionImg = document.createElement("img");
    addClassToElement(conditionImg,"mb-3");
    if(cityName.toLowerCase() === "philadelphia") {
        conditionImg.src = "http://openweathermap.org/img/wn/01d.png";
    } else {
        conditionImg.src = "http://openweathermap.org/img/wn/" + dayData.weather[0].icon + ".png";
    }
    var tempDiv = document.createElement("div");
    addClassToElement(tempDiv,"mb-2");
    addClassToElement(tempDiv,"fontSize18");
    var maxTemp = (dayData.temp.max - 273.15)*1.8 + 32;
    tempDiv.innerHTML = "Temp: " + maxTemp.toFixed(2) + " &deg;F";
    var windDiv = document.createElement("div");
    addClassToElement(windDiv,"mb-2");
    addClassToElement(windDiv,"fontSize18");
    windDiv.textContent = "Wind: " + dayData.wind_speed + " MPH";
    var humidityDiv = document.createElement("div");
    addClassToElement(humidityDiv,"fontSize18");
    humidityDiv.textContent = "Humidity: " + dayData.humidity + "%";
    dayDiv.append(dayHeader,conditionImg,tempDiv,windDiv,humidityDiv);
    return dayDiv;
};

var searchByCoordinates =  function(cityName,longitude,latitude) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${apiId}`;
    fetch(apiUrl)
        .then(function(response) {
            if(response.ok) {
                response.json()
                    .then(function(data) {
                        console.log(data);
                        currentCityEl2.innerHTML = "";
                        for(var i = 1; i < 6; i++) {
                            var nextElement = getDailyForecast(data.daily[i],cityName);
                            currentCityEl2.appendChild(nextElement);
                        }
                        currentCityEl1.innerHTML = "";
                        getTodaysWeather(cityName,data.current);
                    });
            }
        });
};

var priorSearchButton = function(searchedCityOb,arrayIndex) {
    var buttonEl = document.createElement("button");
    buttonEl.className = "btn btn-secondary mt-2";
    buttonEl.setAttribute("data-index",arrayIndex);
    buttonEl.textContent = titlize(searchedCityOb.cityName);
    return buttonEl;
};

var loadPriorSearches = function() {
    if(savedWeatherSearches.length === 0) {
        return;
    }
    prevSearches.innerHTML = "";
    for(var i = 0; i < savedWeatherSearches.length; i++) {
        var nextButton = priorSearchButton(savedWeatherSearches[i],i);
        prevSearches.appendChild(nextButton);
    }
};

//Search by city name - obsolete
var weatherSearchCity = function(cityString) {
    var formattedString = cityString.replace(/ /, "+").toLowerCase();
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + formattedString + "&APPID=b30096dc99b5b0d5c4edfccb15cd2965";
    fetch(apiUrl)
        .then(function(response) {
            if(response.ok) {
                response.json()
                    .then(function(data) {
                        console.log(data);
                        currentCityEl1.textContent = JSON.stringify(data);
                    });
            } else {

            }
        });
};

//Search by longitude and latitude - obsolete
var weatherSearchCoordinates = function(longitude,latitude) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${apiId}`;
    fetch(apiUrl)
        .then(function(response) {
            if(response.ok) {
                response.json()
                    .then(function(data) {
                        console.log(data.daily);
                        var results = document.createElement("div");
                        for(var i = 0; i < data.daily.length; i++) {
                            var nextDiv = document.createElement("div");
                            nextDiv.textContent = JSON.stringify(data.daily[i]);
                            results.appendChild(nextDiv);
                            var breakEl = document.createElement("br");
                            var daySpan = document.createElement("span");
                            daySpan.textContent = moment(data.daily[i].dt*1000).format("MM/D/YYYY");
                            results.appendChild(daySpan);
                            results.appendChild(breakEl);
                        }
                        currentCityEl2.innerHTML = "";
                        //currentCityEl2.textContent = JSON.stringify(data.daily);
                        currentCityEl2.appendChild(results);
                        currentCityEl1.innerHTML = "";
                        currentCityEl1.innerHTML = JSON.stringify(data.current);
                    });
            }
        });
};

//Obsolete
var callBoth = function(cityName,longitude,latitude) {
    //weatherSearchCity(cityName);
    weatherSearchCoordinates(longitude,latitude);
};

var searchForCity = function(cityName,saveSearch = true) {
    var cityAlreadySearched = false;
    var cityIndex = -1;
    for(var i = 0; i < savedWeatherSearches.length; i++) {
        if(cityName.toLowerCase() === savedWeatherSearches[i].cityName) {
            cityIndex = i;
            cityAlreadySearched = true;
            break;
        }
    }
    var longitude = null, latitude = null;
    if(cityAlreadySearched) {
        longitude = savedWeatherSearches[cityIndex].longitude;
        latitude = savedWeatherSearches[cityIndex].latitude;
        savedWeatherSearches = jumpToTheFront(savedWeatherSearches,cityIndex);
        if(saveSearch) {
            saveSearches();
            loadPriorSearches();
        }
        searchByCoordinates(cityName,longitude,latitude);
    } else {
        var formattedString = cityName.replace(/ /, "+").toLowerCase();
        var apiUrl1 = "https://api.openweathermap.org/data/2.5/weather?q=" + formattedString + "&APPID=b30096dc99b5b0d5c4edfccb15cd2965";
        fetch(apiUrl1)
            .then(function(response) {
                if(response.ok) {
                    response.json()
                        .then(function(data) {
                            console.log(data);
                            longitude = data.coord.lon;
                            latitude = data.coord.lat;
                            console.log(longitude);
                            console.log(latitude);
                            var searchObject = {
                                cityName: cityName.toLowerCase(),
                                longitude: longitude,
                                latitude: latitude
                            };
                            if(saveSearch) {
                                savedWeatherSearches.push(searchObject);
                                savedWeatherSearches = jumpToTheFront(savedWeatherSearches,savedWeatherSearches.length - 1);
                                saveSearches();
                                loadPriorSearches();
                            }
                            searchByCoordinates(cityName,longitude,latitude);
                        });
                } else {
                    if(response.status === 404) {
                        var alertMessage = "The city that you input, " + titlize(cityName) + ", did not return any results.  Please check the spelling or try another search.";
                        alert(alertMessage);
                    } else {
                        alert("An unexpected error happened during your search.  Please try again.");
                    }
                    document.querySelector("#city-input").value = "";
                    document.querySelector("#city-input").placeholder = "Enter a City";
                }
            });
    }
};

var loadCityWeather = function(event) {
    event.preventDefault();
    //var arrayIndex = event.target.getAttribute("data-index");
    var cityName = event.target.textContent.trim().toLowerCase();
    searchForCity(cityName);
};

var searchNewCity = function(event) {
    event.preventDefault();
    var cityName = document.querySelector("#city-input").value.trim().toLowerCase();
    if(cityName === "") {
        alert("Please enter a city name to search.");
        return;
    }
    searchForCity(cityName);
    document.querySelector("#city-input").value = "";
    document.querySelector("#city-input").placeholder = "Enter a City";
};

prevSearches.addEventListener("click", loadCityWeather);
cityFormEl.addEventListener("submit", searchNewCity);

//Used to populate
var defaultSearch = ["Houston",-95.3633,29.7633];
//callBoth(...defaultSearch);
loadPriorSearches();
var noSearches = savedWeatherSearches.length === 0 ? true : false;
searchForCity(mostRecentSearch.cityName,!noSearches);

clearSearchBtn.addEventListener("click", function() {
    savedWeatherSearches = [];
    noSearches = true;
    prevSearches.innerHTML = "";
    localStorage.removeItem("savedWeatherSearches");
    mostRecentSearch = placeholderCities[Math.floor(Math.random()*placeholderCities.length)];
    loadPriorSearches();
    searchForCity(mostRecentSearch.cityName,!noSearches);
});