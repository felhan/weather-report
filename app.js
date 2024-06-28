const townSelect = document.getElementById('city');
const currentTown = document.querySelector('.weather_current-town');
const tempMin = document.querySelector('.degree-min');
const tempMax = document.querySelector('.degree-max');
const temperatureCurrent = document.querySelector('.weather_current-tmp');
const sunsetPoint = document.querySelector('#sunset');
const sunrisePoint = document.querySelector('#sunrise');
const sundayPoint = document.querySelector('#sunday');

const cityTranslations = {
    'Москва': 'moscow',
    'Санкт-Петербург': 'saint-petersburg',
    'Алматы': 'almaty',
    'Нью-Йорк': 'new-york',
    'Пхукет': 'phuket',
    'Гомель': 'gomel',
    'Минск': 'minsk'
};

function saveDataToLocalStorage(city, data) {
    const now = new Date().getTime();
    const item = {
        data: data,
        timestamp: now,
        sunlightData: calculateSunlightData(city, data),
        backgroundData: calculateBackgroundData(data)
    };
    localStorage.setItem(city, JSON.stringify(item));
}

function getDataFromLocalStorage(city) {
    const item = localStorage.getItem(city);
    if (!item) return null;

    const parsedItem = JSON.parse(item);
    const now = new Date().getTime();
    if (now - parsedItem.timestamp > 3600000) {
        localStorage.removeItem(city);
        return null;
    }
    return parsedItem;
}

function updateTemperatureBar(temp, barElement) {
    let barWidth;
    if (temp >= 0) {
        barWidth = (temp / 40) * 100;
    } else {
        barWidth = (Math.abs(temp) / 25) * 100;
    }
    barWidth = Math.min(100, Math.max(0, barWidth));

    barElement.style.width = `${barWidth}%`;

    let barColor;
    if (temp >= 0) {
        let redIntensity = 255;
        let greenIntensity = Math.max(150, Math.min(255, 255 - (temp * 3)));
        let blueIntensity = 0;
        barColor = `rgb(${redIntensity}, ${greenIntensity}, ${blueIntensity})`;
    } else {
        let blue = 255;
        let red = Math.max(0, 100 - Math.abs(temp) * 4);
        let green = Math.max(0, 150 - Math.abs(temp) * 6);
        barColor = `rgb(${red}, ${green}, ${blue})`;
    }
    barElement.style.backgroundColor = barColor;
}

function getData(city, startDate, endDate) {
    const cachedData = getDataFromLocalStorage(city);
    if (cachedData) {
        processWeatherData(cachedData.data);
        updateBackground(cachedData.backgroundData);
        return;
    }

    const apiKey = "PTXGDJARNVEHXS666PDAX3G6L";
    const baseUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
    const url = `${baseUrl}${city}/${startDate}/${endDate}?unitGroup=metric&include=hours&key=${apiKey}&contentType=json`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const backgroundData = calculateBackgroundData(data);
            saveDataToLocalStorage(city, data);
            processWeatherData(data);
            updateBackground(backgroundData);
        })
        .catch(err => {
            console.error('Ошибка запроса: ', err);
        });
}

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

    if (clockInterval) {
        clearInterval(clockInterval);
    }

    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function processWeatherData(data) {
    if (data.timezone) {
        updateTimeWithTimezone(data.timezone);
        extractWeatherData(data);
        sunsetSunrise(data);
        updateWeeklyForecast(data);
    } else {
        console.error('Часовой пояс не найден в ответе API');
    }
}

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

    const mainWeatherDescription = document.querySelector('.weather_current-sunniest');
    const translatedMainCondition = translateWeatherCondition(data.days[0].conditions);
    mainWeatherDescription.textContent = translatedMainCondition;
}

function getWeatherIcon(icon) {
    return `images/weather-icons/${icon}.svg`;
}

function updateWeatherDisplay(data) {
    const currentConditions = data.days[0].conditions;
    const currentIcon = data.days[0].icon;
    const iconPath = getWeatherIcon(currentIcon);

    const weatherIconElement = document.querySelector('.day-icon');
    weatherIconElement.src = iconPath;

    const weatherDescriptionElement = document.querySelector('.weather_current-sunniest');
    const translatedCondition = translateWeatherCondition(currentConditions);
    weatherDescriptionElement.textContent = translatedCondition;

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

    return condition;
}

function calculateSunlightData(city, data) {
    let sunset = data.days[0].sunset;
    let sunrise = data.days[0].sunrise;

    const sunsetTime = new Date(`2000-01-01T${sunset}`);
    const sunriseTime = new Date(`2000-01-01T${sunrise}`);
    
    let diffMs = sunsetTime - sunriseTime;
    if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
    }

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    return {
        sunset: sunset,
        sunrise: sunrise,
        daylightDuration: `${diffHrs} ч ${diffMins} мин`
    };
}

function sunsetSunrise(data) {
    const city = townSelect.value;
    const cachedData = getDataFromLocalStorage(city);

    let sunlightData;
    if (cachedData && cachedData.sunlightData) {
        sunlightData = cachedData.sunlightData;
    } else {
        sunlightData = calculateSunlightData(city, data);
    }

    sunsetPoint.innerText = sunlightData.sunset.slice(0, 5);
    sunrisePoint.innerText = sunlightData.sunrise.slice(0, 5);
    sundayPoint.innerText = sunlightData.daylightDuration;
}

function updateWeeklyForecast(data) {
    const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const weatherItems = document.querySelectorAll('.weather_week-item');

    data.days.forEach((day, index) => {
        if (index >= weatherItems.length) return; // Прекращаем, если элементов больше, чем дней

        const weatherItem = weatherItems[index];
        if (!weatherItem) return; // Проверка на существование элемента

        const date = new Date(day.datetime);
        const dayOfWeek = index === 0 ? 'Сегодня' : weekDays[date.getDay()];

        const dayElement = weatherItem.querySelector('.day');
        const iconElement = weatherItem.querySelector('.icon');
        const minTempElement = weatherItem.querySelector('.degree');
        const maxTempElement = weatherItem.querySelector('.degree-day');
        const temperatureBar = weatherItem.querySelector('.temperature-bar');

        if (dayElement) dayElement.textContent = dayOfWeek;
        if (iconElement) iconElement.src = `images/weather-icons/${day.icon}.svg`;
        if (minTempElement) minTempElement.textContent = `${Math.round(day.tempmin)}°C`;
        if (maxTempElement) maxTempElement.textContent = `${Math.round(day.tempmax)}°C`;
        if (temperatureBar) updateTemperatureBar(day.tempmax, temperatureBar);
    });
}

function calculateBackgroundData(data) {
    const currentHour = new Date().toLocaleString('en-US', { timeZone: data.timezone, hour: 'numeric', hour12: false });
    let backgroundImage;
    let isNight = false;

    if (currentHour >= 21 || currentHour < 4) {
        backgroundImage = 'night-sky.jpg';
        isNight = true;
    } else if (currentHour >= 4 && currentHour < 7) {
        backgroundImage = 'morning-sky.jpg';
    } else if (currentHour >= 7 && currentHour < 18) {
        backgroundImage = 'day-sky.jpg';
    } else {
        backgroundImage = 'evening-sky.jpg';
    }

    return { backgroundImage, isNight };
}

function updateBackground(backgroundData) {
    const weatherCurrent = document.querySelector('.weather_current');
    const weatherWeek = document.querySelector('.weather_week');

    document.documentElement.style.setProperty('--background-image', `url('images/background-weather/${backgroundData.backgroundImage}')`);

    if (backgroundData.isNight) {
        weatherCurrent.classList.add('night');
        weatherWeek.classList.add('night');
    } else {
        weatherCurrent.classList.remove('night');
        weatherWeek.classList.remove('night');
    }
}

townSelect.addEventListener('change', function (evt) {
    evt.preventDefault();
    currentTown.innerText = townSelect.value;
    sendData();
});

document.addEventListener('DOMContentLoaded', function () {
    currentTown.innerText = townSelect.value;
    sendData();
});