const townSelect = document.getElementById('city');
var currentTown = document.querySelector('.weather_current-town');

townSelect.addEventListener('change', function () {
    currentTown.innerText = townSelect.value;
});

function updateTemperatureBar(temp, barElement) {
    let barWidth;
    if (temp >= 0) {
        // Диапазон от 0°C до 40°C для положительных температур
        barWidth = (temp / 40) * 100;
    } else {
        // Диапазон от 0°C до -25°C для отрицательных температур
        barWidth = (Math.abs(temp) / 25) * 100;
    }
    // Ограничиваем ширину полоски от 0% до 100%
    barWidth = Math.min(100, Math.max(0, barWidth));

    // Обновляем ширину полоски
    barElement.style.width = `${barWidth}%`;

    // Обновляем цвет полоски в зависимости от температуры
    let barColor;
    if (temp >= 0) {
        // Градиент от желтого до оранжевого для температур от 0°C до 40°C
        let redIntensity = 255;
        let greenIntensity = Math.max(150, Math.min(255, 255 - (temp * 3)));
        let blueIntensity = 0;
        barColor = `rgb(${redIntensity}, ${greenIntensity}, ${blueIntensity})`;
    } else {
        // Градиент от темно-голубого до темно-синего для температур от 0°C до -25°C
        let blue = 255;
        let red = Math.max(0, 100 - Math.abs(temp) * 4);
        let green = Math.max(0, 150 - Math.abs(temp) * 6);
        barColor = `rgb(${red}, ${green}, ${blue})`;
    }
    barElement.style.backgroundColor = barColor;
}



// Функция для извлечения температур из списка и обновления полоски
function updateFromWeatherList() {
    const weatherItems = document.querySelectorAll('.weather_week-item'); // исправленный селектор

    weatherItems.forEach(function (item) {
        const tempText = item.querySelector('.degree-day').textContent.trim(); // получаем текст температуры и удаляем пробелы
        const tempValue = parseInt(tempText, 10); // извлекаем числовое значение из "-25°C"
        const barElement = item.querySelector('.temperature-bar');

        updateTemperatureBar(tempValue, barElement);
    });
}

// Начальный вызов для обновления полосок
document.addEventListener('DOMContentLoaded', function () {
    updateFromWeatherList();
    test();

});
test();

// updateClock();
// setInterval(updateClock, 30000);

// Sunrise and sunset logic
const sunriseTime = "05:30";
const sunsetTime = "20:00";

// Convert time strings to minutes since midnight for easier calculation
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
}

const sunriseMinutes = timeToMinutes(sunriseTime);
const sunsetMinutes = timeToMinutes(sunsetTime);

// Get current time in minutes since midnight
const now = new Date();
const currentMinutes = now.getHours() * 60 + now.getMinutes();

// Calculate daylight length and progress
const daylightLength = sunsetMinutes - sunriseMinutes;
const currentProgress = ((currentMinutes - sunriseMinutes) / daylightLength) * 100;

// Update DOM with sunrise and sunset times
document.getElementById("sunriseTime").textContent = sunriseTime;
document.getElementById("sunsetTime").textContent = sunsetTime;

// Update progress bar width based on current time
document.getElementById("daylightProgress").style.width = `${currentProgress}%`;



function getData(city, startDate, endDate) {
    const apiKey = "PTXGDJARNVEHXS666PDAX3G6L";
    const baseUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";

    const url = `${baseUrl}${city}/${startDate}/${endDate}?unitGroup=metric&include=hours&key=${apiKey}&contentType=json`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json(); // Преобразование тела ответа в JSON
        })
        .then(data => {
            // Теперь 'data' содержит данные о погоде
            console.log(data); // Ваши данные о погоде

            const weatherHours = data.days;
            console.log(weatherHours);
            console.log(data.hours);
            console.log(data.currentConditions);
        })
        .catch(err => {
            console.error('Fetch error: ', err);
        });
}


function sendData(startDate, endDate){
    const russianCityName = currentTown.innerText;
    const englishCityName = cityTranslations[russianCityName];
 
    getData(englishCityName, startDateString, endDateString);

};


function test () {
    fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/ALMATY/2024-06-25/2024-07-09?unitGroup=metric&include=hours%2Cdays%2Ccurrent&key=PTXGDJARNVEHXS666PDAX3G6L&contentType=json", {
        "method": "GET",
        "headers": {
        }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json(); // Преобразование тела ответа в JSON
        })
        .then(data => {
            // Теперь 'data' содержит данные о погоде
            console.log(data); // Ваши данные о погоде

            const weatherHours = data.days;
            console.log(weatherHours);
            console.log(data.hours);
            console.log(data.currentConditions);
        })
        .catch(err => {
            console.error('Fetch error: ', err);
        });
      
}

test();


