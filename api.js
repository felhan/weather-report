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
        console.log(response);
      })
      .catch(err => {
        console.error(err);
      });
      
}

getData();
getMoscow();