const townSelect = document.getElementById('city');
var currentTown = document.querySelector('.weather_current-town');

townSelect.addEventListener('change', function () {
    currentTown.innerText = townSelect.value;
});

function updateTemperatureBar(temp, barElement) {
    // Calculate the width of the bar as a percentage
    let barWidth = (temp / 40) * 100; // assuming 40°C is the maximum temperature for full width
    if (barWidth > 100) barWidth = 100; // cap the width at 100%
    
    // Update the width of the bar
    barElement.style.width = `${barWidth}%`;
    
    // Update the color of the bar based on temperature
    let barColor;
    if (temp <= 0) {
        barColor = '#00f'; // blue for cold
    } else if (temp <= 10) {
        barColor = '#0ff'; // cyan for cool
    } else if (temp <= 20) {
        barColor = '#0f0'; // green for mild
    } else if (temp <= 30) {
        barColor = '#ff0'; // yellow for warm
    } else {
        barColor = '#f00'; // red for hot
    }
    
    barElement.style.backgroundColor = barColor;
}

// Function to extract temperatures from the list and update the bar
function updateFromWeatherList() {
    const weatherItems = document.querySelectorAll('.weather_week-item'); // Corrected selector
    
    weatherItems.forEach(function (item) {
        const tempText = item.querySelector('.degree').textContent.trim(); // Get temperature text and trim whitespace
        const tempValue = parseInt(tempText); // Extract numeric value from "25°C"
        const barElement = item.querySelector('.temperature-bar');
        
        updateTemperatureBar(tempValue, barElement);
    });
}

// Initial call to update bars
document.addEventListener('DOMContentLoaded', function() {
    updateFromWeatherList();
});


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
        const currentProgress = (currentMinutes - sunriseMinutes) / daylightLength * 100;

        // Update DOM with sunrise and sunset times
        document.getElementById("sunriseTime").textContent = sunriseTime;
        document.getElementById("sunsetTime").textContent = sunsetTime;

        // Update progress bar width based on current time
        document.getElementById("daylightProgress").style.width = `${currentProgress}%`;

