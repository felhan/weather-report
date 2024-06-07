
    const townSelect = document.getElementById('city');
    var currentTown = document.querySelector('.weather_current-town');

    townSelect.addEventListener('change', function () {
        currentTown.innerText = townSelect.value;
    });