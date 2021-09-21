
//Retrieve weather search history from localStorage
//Will be stored as lower case strings of city names
var savedWeatherSearches = JSON.parse(localStorage.getItem("savedWeatherSearches")) || [];
var mostRecentSearch = JSON.parse(localStorage.getItem("mostRecentSearch")) || { cityName: "houston", longitude: -95.3633, latitude: 29.7633 };

var saveSearches = function() {
    localStorage.setItem("savedWeatherSearches",JSON.stringify(savedWeatherSearches));
};

//API ID
var apiId = "b30096dc99b5b0d5c4edfccb15cd2965";

//Page elements
var citySearchEl = document.querySelector("#city-search");
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
    cityHeader.textContent = cityAndDay;
    var tempDiv = document.createElement("div");
    var maxTemp = (dayData.temp.max - 273.15)*1.8 + 32;
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

var getDailyForecast = function(dayData) {
    var dayDiv = document.createElement("div");
    dayDiv.className = "flex-column col";
    var dayHeader = document.createElement("h4");
    dayHeader.textContent = moment(dayData.dt*1000).format("MM/D/YYYY");
    //Some sort of weather symbol?
    var tempDiv = document.createElement("div");
    var maxTemp = (dayData.temp.max - 273.15)*1.8 + 32;
    tempDiv.innerHTML = "Temp: " + maxTemp.toFixed(2) + " &deg;F";
    var windDiv = document.createElement("div");
    windDiv.textContent = "Wind: " + dayData.wind_speed + " MPH";
    var humidityDiv = document.createElement("div");
    humidityDiv.textContent = "Humidity: " + dayData.humidity + "%";
    dayDiv.append(dayHeader,tempDiv,windDiv,humidityDiv);
    return dayDiv;
};

var searchByCoordinates =  function(cityName,longitude,latitude) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&appid=${apiId}`;
    fetch(apiUrl)
        .then(function(response) {
            if(response.ok) {
                response.json()
                    .then(function(data) {
                        console.log(data);
                        currentCityEl2.innerHTML = "";
                        for(var i = 1; i < 6; i++) {
                            var nextElement = getDailyForecast(data.daily[i]);
                            currentCityEl2.appendChild(nextElement);
                        }
                        currentCityEl1.innerHTML = "";
                        getTodaysWeather(cityName,data.daily[0]);
                    });
            }
        });
};

//Search by city name
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

//Search by longitude and latitude
var weatherSearchCoordinates = function(longitude,latitude) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&appid=${apiId}`;
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
                    });
            }
        });
};

var callBoth = function(cityName,longitude,latitude) {
    weatherSearchCity(cityName);
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
                            saveSearches();
                            searchByCoordinates(cityName,longitude,latitude);
                        });
                }
            });
    }
};

//Used to populate
var defaultSearch = ["Houston",-95.3633,29.7633];
//callBoth(...defaultSearch);
searchForCity("New York");