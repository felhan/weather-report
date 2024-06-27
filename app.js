const townSelect = document.getElementById('city');
const currentTown = document.querySelector('.weather_current-town');
const tempMin = document.querySelector('.degree-min');
const tempMax = document.querySelector('.degree-max');

// Функция для сохранения данных в localStorage
function saveDataToLocalStorage(city, data) {
    const now = new Date().getTime();
    const item = {
        data: data,
        timestamp: now
    };
    localStorage.setItem(city, JSON.stringify(item));
}

function getDataFromLocalStorage(city) {
    const item = localStorage.getItem(city);
    if (!item) return null;

    const parsedItem = JSON.parse(item);
    const now = new Date().getTime();
    // Проверяем, не устарели ли данные (например, 1 час)
    if (now - parsedItem.timestamp > 3600000) {
        localStorage.removeItem(city);
        return null;
    }
    return parsedItem.data;
}

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

document.addEventListener('DOMContentLoaded', function () {
    currentTown.innerText = townSelect.value;
    updateFromWeatherList();
    sendData();
});

function getData(city, startDate, endDate) {
    // Проверяем, есть ли данные в localStorage
    const cachedData = getDataFromLocalStorage(city);
    if (cachedData) {
        processWeatherData(cachedData);
        return;
    }

    const apiKey = "PTXGDJARNVEHXS666PDAX3G6L";
    const baseUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
    const url = `${baseUrl}${city}/${startDate}/${endDate}?unitGroup=metric&include=hours&key=${apiKey}&contentType=json`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            saveDataToLocalStorage(city, data);
            processWeatherData(data);
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

function processWeatherData(data) {
    if (data.timezone) {
        updateTimeWithTimezone(data.timezone);
        extractWeatherData(data);
    } else {
        console.error('Timezone not found in the API response');
    }
}

townSelect.addEventListener('change', function (evt) {
    evt.preventDefault();
    currentTown.innerText = townSelect.value;
    sendData();
});

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
}


function extractWeatherData(data) {
    const minTemp = data.days[0].tempmin;
    const maxTemp = data.days[0].tempmax;
    const tempNow = data.days[0].temp;

    tempMin.innerText = `${Math.floor(minTemp)}°C`;
    tempMax.innerText = `${Math.floor(maxTemp)}°C`;
    temperatureCurrent.innerText = `${Math.floor(tempNow)}°C`;

    updateWeatherDisplay(data);

    // Обновляем основное описание погоды
    const mainWeatherDescription = document.querySelector('.weather_current-sunniest');
    const translatedMainCondition = translateWeatherCondition(data.days[0].conditions);
    mainWeatherDescription.textContent = translatedMainCondition;
}

const hourTime = Array.from(document.querySelectorAll('.time'));
const hourTemp = Array.from(document.querySelectorAll('.temperature'));
const temperatureCurrent = document.querySelector('.weather_current-tmp');

function hourReport(hourlyTemps) {
    for (let i = 0; i < hourTime.length; i++) {
        hourTime[i].innerText = hourlyTemps[i].datetime.slice(0, 2);
        hourTemp[i].innerText = `${Math.floor(hourlyTemps[i].temp)}°C`;
    }
};


function getWeatherIcon(icon) {
    // Предполагаем, что названия иконок в API совпадают с вашими файлами
    return `images/weather-icons/${icon}.svg`;
}

function updateWeatherDisplay(data) {
    const currentConditions = data.days[0].conditions;
    const currentIcon = data.days[0].icon;
    const iconPath = getWeatherIcon(currentIcon);

    const weatherIconElement = document.querySelector('.day-icon');
    weatherIconElement.src = iconPath;

    // Обновляем текстовое описание погоды
    const weatherDescriptionElement = document.querySelector('.weather_current-sunniest');
    const translatedCondition = translateWeatherCondition(currentConditions);
    weatherDescriptionElement.textContent = translatedCondition;

    // Получаем текущее время в часовом поясе выбранного города
    const options = {
        timeZone: data.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const cityTime = new Date().toLocaleString('ru-RU', options);
    const currentHour = parseInt(cityTime.split(':')[0]);

    const weatherItems = document.querySelectorAll('.weather_current-item');

    weatherItems.forEach((item, index) => {
        const hourIndex = (currentHour + index + 1) % 24;
        const hourData = data.days[0].hours[hourIndex];
        const iconPath = getWeatherIcon(hourData.icon);

        const timeElement = item.querySelector('.time');
        const iconElement = item.querySelector('.day-icon');
        const tempElement = item.querySelector('.temperature');

        timeElement.textContent = hourData.datetime.slice(0, 2);
        iconElement.src = iconPath;
        tempElement.textContent = `${Math.floor(hourData.temp)}°C`;
    });
}

function translateWeatherCondition(condition) {
    const conditionMap = {
        'clear': 'Ясно',
        'partly cloudy': 'Переменная облачность',
        'cloudy': 'Облачно',
        'overcast': 'Пасмурно',
        'rain': 'Дождь',
        'snow': 'Снег',
        'sleet': 'Мокрый снег',
        'thunderstorm': 'Гроза',
        'fog': 'Туман',
        'wind': 'Ветрено'
    };

    const lowercaseCondition = condition.toLowerCase();

    for (const [engCondition, rusCondition] of Object.entries(conditionMap)) {
        if (lowercaseCondition.includes(engCondition)) {
            return rusCondition;
        }
    }

    // Если перевод не найден, возвращаем оригинальное значение
    return condition;
}






