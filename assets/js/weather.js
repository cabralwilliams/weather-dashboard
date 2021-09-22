
//Retrieve weather search history from localStorage
//Will be stored as lower case strings of city names
var savedWeatherSearches = JSON.parse(localStorage.getItem("savedWeatherSearches")) || [];
var mostRecentSearch = savedWeatherSearches.length === 0 ? { cityName: "houston", longitude: -95.3633, latitude: 29.7633 } : savedWeatherSearches[0];

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

//API ID
var apiId = "b30096dc99b5b0d5c4edfccb15cd2965";

//Page elements
var citySearchEl = document.querySelector("#city-search");
var cityFormEl = document.querySelector("#city-form");
var prevSearches = document.querySelector("#previous-searches");
var currentCityEl1 = document.querySelector("#current-city-today");
var currentCityEl2 = document.querySelector("#current-city-five-day");

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
    var maxTemp = (dayData.temp - 273.15)*1.8 + 32;
    tempDiv.innerHTML = "Temp: " + maxTemp.toFixed(2) + " &deg;F";
    var windDiv = document.createElement("div");
    windDiv.textContent = "Wind: " + dayData.wind_speed + " MPH";
    var humidityDiv = document.createElement("div");
    humidityDiv.textContent = "Humidity: " + dayData.humidity + "%";
    var uvDiv = document.createElement("div");
    var uvSpan = "<span class='";
    var uvi = dayData.uvi;
    if(uvi <= 2.5) {
        uvSpan += "bgLow";
    } else if(uvi <= 5.5) {
        uvSpan += "bgModerate";
    } else if(uvi <= 7.5) {
        uvSpan += "bgHigh";
    } else if(uvi <= 10.5) {
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
    dayDiv.className = "flex-column col";
    var dayHeader = document.createElement("h4");
    dayHeader.textContent = moment(dayData.dt*1000).format("MM/D/YYYY");
    //Some sort of weather symbol?
    var conditionImg = document.createElement("img");
    if(cityName.toLowerCase() === "philadelphia") {
        conditionImg.src = "http://openweathermap.org/img/wn/01d.png";
    } else {
        conditionImg.src = "http://openweathermap.org/img/wn/" + dayData.weather[0].icon + ".png";
    }
    var tempDiv = document.createElement("div");
    var maxTemp = (dayData.temp.max - 273.15)*1.8 + 32;
    tempDiv.innerHTML = "Temp: " + maxTemp.toFixed(2) + " &deg;F";
    var windDiv = document.createElement("div");
    windDiv.textContent = "Wind: " + dayData.wind_speed + " MPH";
    var humidityDiv = document.createElement("div");
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
    buttonEl.className = "btn btn-primary mt-3";
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

var searchForCity = function(cityName) {
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
        saveSearches();
        loadPriorSearches();
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
                            savedWeatherSearches.push(searchObject);
                            savedWeatherSearches = jumpToTheFront(savedWeatherSearches,savedWeatherSearches.length - 1);
                            saveSearches();
                            loadPriorSearches();
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
searchForCity(mostRecentSearch.cityName);