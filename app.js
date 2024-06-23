const townSelect = document.getElementById('city');
var currentTown = document.querySelector('.weather_current-town');

townSelect.addEventListener('change', function () {
    currentTown.innerText = townSelect.value;
    getData();
});

function updateTemperatureBar(temp, barElement) {
    let barWidth;
    let barColor;

    if (temp <= -20) {
        // Полностью синяя полоска (#2084bb) при температуре -20°C и ниже
        barWidth = 100;
        barColor = '#2084bb';
    } else if (temp < 0) {
        // Градиент от светло-синего (#b8e0f9) до синего (#2084bb) для температур от -1°C до -20°C
        barWidth = ((temp + 1) / 19) * 100;
        let blueIntensity = Math.max(184, Math.min(255, 184 + (temp * 3))); // интерполируем от светло-синего к синему
        let whiteIntensity = Math.max(184, Math.min(255, 224 + (temp * 4.25))); // светло-синий к синему
        barColor = `rgb(${whiteIntensity}, ${whiteIntensity}, ${blueIntensity})`;
    } else {
        // Для положительных температур от 0°C до 40°C, полоска будет полностью прозрачной
        barWidth = 0;
        barColor = 'transparent';
    }

    // Ограничиваем ширину полоски от 0% до 100%
    barWidth = Math.max(0, Math.min(100, barWidth));

    // Обновляем ширину и цвет полоски
    barElement.style.width = `${barWidth}%`;
    barElement.style.backgroundColor = barColor;
};



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

updateClock();
setInterval(updateClock, 30000);
getDate();
updateDate();

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

function getDate() {
    let city = document.querySelector('#city');
    
    const startDate = updateClock();
    const startDateString = `${startDate.year}-${startDate.month}-${startDate.day}`;
    
    const startDateObj = new Date(`${startDate.year}-${startDate.month}-${startDate.day}`);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + 7);
    
    const endDateString = `${endDateObj.getFullYear()}-${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}-${endDateObj.getDate().toString().padStart(2, '0')}`;
    
    getData(city, startDateString, endDateString);
}

function updateDate() {
    const currentDate = new Date();

    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    const currentTimeString = `${hours}:${minutes}`;

    document.querySelector('.time-now').textContent = currentTimeString;

    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    return { year, month, day };
};


