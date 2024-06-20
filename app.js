const townSelect = document.getElementById('city');
var currentTown = document.querySelector('.weather_current-town');

townSelect.addEventListener('change', function () {
    currentTown.innerText = townSelect.value;

    getData();
    getMoscow();
});

function updateTemperatureBar(temp, barElement) {
    // Calculate the width of the bar as a percentage
    let barWidth;
    if (temp >= 0) {
        barWidth = (temp / 40) * 100; // предполагаем, что диапазон от 0°C до 40°C для положительных температур
    } else {
        barWidth = ((temp + 20) / 60) * 100; // предполагаем, что диапазон от -20°C до 0°C для отрицательных температур
    }

    if (barWidth > 100) barWidth = 100; // ограничиваем ширину до 100%
    if (barWidth < 0) barWidth = 0; // ограничиваем ширину до 0%

    // Обновляем ширину полоски
    barElement.style.width = `${barWidth}%`;

    // Обновляем цвет полоски в зависимости от температуры
    let barColor;
    if (temp <= 0) {
        // Градиент от светло-синего до синего для холодных температур от -20°C до 0°C
        let blueIntensity = Math.max(0, Math.min(255, 255 + (temp * 6))); // интерполируем от светло-синего к синему
        let whiteIntensity = Math.max(200, Math.min(255, 255 + (temp * 2.75))); // светло-синий к синему
        barColor = `rgb(${whiteIntensity}, ${whiteIntensity}, ${blueIntensity})`;
    } else {
        // Градиент от желтого до оранжевого для теплых температур от 0°C до 40°C
        let redIntensity = 255; // постоянный максимальный красный
        let greenIntensity = Math.max(150, Math.min(255, 255 - (temp * 3))); // уменьшаем зеленый для получения оранжевого
        let blueIntensity = 0; // нет синего
        barColor = `rgb(${redIntensity}, ${greenIntensity}, ${blueIntensity})`;
    }

    barElement.style.backgroundColor = barColor;
}

// Функция для извлечения температур из списка и обновления полоски
function updateFromWeatherList() {
    const weatherItems = document.querySelectorAll('.weather_week-item'); // исправленный селектор

    weatherItems.forEach(function (item) {
        const tempText = item.querySelector('.degree').textContent.trim(); // получаем текст температуры и удаляем пробелы
        const tempValue = parseInt(tempText, 10); // извлекаем числовое значение из "-25°C"
        const barElement = item.querySelector('.temperature-bar');

        updateTemperatureBar(tempValue, barElement);
    });
}

// Начальный вызов для обновления полосок
document.addEventListener('DOMContentLoaded', function () {
    updateFromWeatherList();
});

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



function getData() {
    fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/almaty?unitGroup=metric&include=days%2Chours%2Calerts%2Ccurrent&key=PTXGDJARNVEHXS666PDAX3G6L&contentType=json", {
        "method": "GET",
        "headers": {
        }
        })
      .then(response => {
        console.log(response);
      })
      .catch(err => {
        console.error(err);
      });      
      
      
}

function getMoscow() {
    fetch("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/moscow?unitGroup=metric&include=days%2Chours%2Calerts%2Ccurrent&key=PTXGDJARNVEHXS666PDAX3G6L&contentType=json", {
        "method": "GET",
        "headers": {
        }
        })
      .then(response => {
        const data = response.json();
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
      
}