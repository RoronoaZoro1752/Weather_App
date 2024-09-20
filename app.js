const city = document.getElementById('inputcity');
const searchbtn = document.getElementById('searchbtn');
const dropdown = document.getElementById('recent_dropdown');

const loca_btn = document.getElementById("location_btn");

const city_title = document.getElementById('city');
const city_temp = document.getElementById('temperature');
const city_humidity = document.getElementById('humidity');
const city_wind = document.getElementById('wind');
const weather_img = document.getElementById('image');
const condition = document.getElementById('condition');


function fetchWeather(cityName){
    if(!cityName){
        alert("Please enter a city name");
        return;
    }

    fetch(`http://api.weatherapi.com/v1/forecast.json?key=${Your-api-key}&q=${cityName}&days=6`)
        .then(response => response.json())
        .then(data => {
            UpdateUi(data);
            saveRecentCity(cityName);
            dropdownfunction();
        })
        .catch(error => {
            if(error.message == 'Failed to fetch'){
                alert("Network error: Check your network connection.."); 
                
            }
            else{
                alert(error.message); 
            }
            
            document.getElementById('inputcity').value = '';
            console.error("Error fetching weather data: ", error)
        });
}

function UpdateUi(data){
    const text = data.current.condition.text;
    const temp = data.current.temp_c;
    const todayImg = data.current.condition.icon;
    const todayWind = data.current.wind_mph;
    const todayHumidity = data.current.humidity;

    city_title.textContent = data.location.name;
    city_temp.textContent = `Temperature: ${temp}°C`;
    city_wind.textContent = `Wind: ${todayWind}Mph`;
    city_humidity.textContent = `Humidity: ${todayHumidity}%`;
    weather_img.src = todayImg;
    condition.textContent = text;

    const forecastdays = data.forecast.forecastday.slice(1);

    forecastdays.forEach((day, index) => {
        const dateElement = document.querySelector(`#card_date_${index +1}`);
        const imgElement = document.querySelector(`#card_img_${index +1}`);
        const tempElement = document.querySelector(`#card_temp_${index + 1}`);
        const humidityElement = document.querySelector(`#card_humidity_${index + 1}`);
        const windElement = document.querySelector(`#card_wind_${index + 1}`);

        // Check if the elements exist before setting the values
        if (dateElement && imgElement && tempElement && humidityElement && windElement) {
            const date = day.date;
            const condition = day.day.condition.icon;
            const maxTemp = day.day.maxtemp_c;
            const maxWind = day.day.maxwind_mph;
            const avgHumidity = day.day.avghumidity;

            dateElement.textContent = date;
            imgElement.src = condition;
            tempElement.textContent = `Temperature: ${maxTemp}°C`;
            humidityElement.textContent = `Humidity: ${avgHumidity}%`;
            windElement.textContent = `Wind: ${maxWind} Mph`;
        }
    });
}

searchbtn.addEventListener('click', () => {
    const cityName = city.value.trim();
    fetchWeather(cityName);
    document.getElementById('inputcity').value = '';
});

loca_btn.addEventListener('click', () => {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            fetch(`http://api.weatherapi.com/v1/forecast.json?key=${Your-api-key}&q=${lat},${long}&days=6`)
                .then(response => response.json())
                .then(data =>{
                    UpdateUi(data);
                    saveRecentCity(data.location.name);
                    dropdownfunction();
                } )
                .catch(error => console.error('Error: Not able to access the current location', error));
        }, () => {
            alert("Unable to retrieve your location");
        });
    }else{
        alert("Geolocation is not supported by your browser.");
    }
});

function saveRecentCity(cityName){
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if(!recentCities.includes(cityName)){
        recentCities.unshift(cityName);
        if(recentCities.length > 10) recentCities.pop();
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
}

function dropdownfunction(){
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    
    dropdown.innerHTML = '<option value="" selected disabled>Select a city</option>';
    recentCities.forEach(cityName => {
        const option = document.createElement('option');
        option.textContent = cityName;
        option.value =cityName;
        dropdown.appendChild(option);
    })
}

dropdown.addEventListener('change', (event) =>{
    const selectedCity = event.target.value;
    fetchWeather(selectedCity);
})

window.onload = () => {
    dropdownfunction();
}
