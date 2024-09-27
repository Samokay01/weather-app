require("dotenv").config();

const express = require("express");
const https = require("node:https");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index", { weatherData: null, error: null });
});



function getWeatherCategory(condition) {
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes('rain')) {
        return 'rain';
    } else if (conditionLower.includes('clouds')) {
        return 'few-clouds';
    } else if (conditionLower.includes('clear')) {
        return 'clear-sky';
    } else if (conditionLower.includes('snow')) {
        return 'snow';
    } else if (conditionLower.includes('thunderstorm')) {
        return 'thunderstorm';
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog')) {
        return 'mist';
    } else {
        return 'default';
    }
}




app.post("/", (req, res) => {
    const query = req.body.cityName;
    const apiKey = process.env.API_KEY;
    const unit = req.body.unit || "metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + apiKey + "&units=" + unit;

    https.get(url, function (response) {
        //console.log(response.statusCode);

        response.on("data", (data) => {
            const weatherData = JSON.parse(data);

            if (response.statusCode === 200) {
                const temp = weatherData.main.temp;
                const weatherCondition = weatherData.weather[0].description;
                const icon = weatherData.weather[0].icon;
                const city = weatherData.name;
                const country = weatherData.sys.country;
                
                const tempInFahrenheit = (temp * 9/5) + 32;
                const weatherCategory = getWeatherCategory(weatherCondition);

                res.render("index", {
                    weatherData: {
                        city,
                        country,
                        temp: unit === "imperial" ? tempInFahrenheit.toFixed(1) : temp.toFixed(1),
                        unit: unit === "imperial" ? "F" : "C",
                        weatherCondition,
                        weatherCategory,
                        icon
                    },
                    error: null
                });
            } else {
                res.render("index", { weatherData: null, error: "City not found" });
            }
        });
    }).on("error", (e) => {
        res.render("index", { weatherData: null, error: "Unable to fetch weather data" });
    });
});

app.listen(port, function () {
    console.log("server started on port 3000");
});
