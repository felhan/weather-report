const townSelect = document.getElementById('city');
var currentTown = document.querySelector('.weather_current-town');

townSelect.addEventListener('change', function (evt) {
    evt.preventDefault();
    currentTown.innerText = townSelect.value;
    sendData();
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
};



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
    currentTown.innerText = townSelect.value;
    updateFromWeatherList();
    sendData();
});


// updateClock();
// setInterval(updateClock, 30000);



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
            console.log(data);
            if (data.timezone) {
                updateTimeWithTimezone(data.timezone);
            } else {
                console.error('Timezone not found in the API response');
            }
        })
        .catch(err => {
            console.error('Fetch error: ', err);
        });
};

let clockInterval;

function updateTimeWithTimezone(timezone) {
    const options = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    function updateClock() {
        const currentTime = new Date().toLocaleTimeString('ru-RU', options);
        document.querySelector('.time-now').textContent = currentTime;
    }

    // Очищаем предыдущий интервал, если он существует
    if (clockInterval) {
        clearInterval(clockInterval);
    }

    // Обновляем время сразу
    updateClock();

    // Устанавливаем новый интервал для обновления времени каждую секунду
    clockInterval = setInterval(updateClock, 1000);
};

const cityTranslations = {
    'Москва': 'moscow',
    'Санкт-Петербург': 'saint-petersburg',
    'Алматы': 'almaty',
    'Нью-Йорк': 'new-york',
    'Пхукет': 'phuket',
    'Гомель': 'gomel'
};


function sendData() {
    const russianCityName = currentTown.innerText;
    const englishCityName = cityTranslations[russianCityName];

    const currentDate = new Date();
    const startDateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

    const endDateObj = new Date(currentDate);
    endDateObj.setDate(currentDate.getDate() + 7);
    const endDateString = `${endDateObj.getFullYear()}-${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}-${endDateObj.getDate().toString().padStart(2, '0')}`;

    getData(englishCityName, startDateString, endDateString);
};






