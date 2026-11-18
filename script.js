document.getElementById('cityInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        getWeather();
    }
});

function searchPreset(cityName) {
    document.getElementById('cityInput').value = cityName;
    getWeather();
}

async function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const cityName = cityInput.value.trim();
    
    const resultContainer = document.getElementById('resultContainer');
    const errorContainer = document.getElementById('errorContainer');
    const loading = document.getElementById('loading');

    if (!cityName) return;

    resultContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=id`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            loading.classList.add('hidden');
            errorContainer.classList.remove('hidden');
            return;
        }

        const { latitude, longitude, name, country, elevation, timezone } = geoData.results[0];

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherResponse.json();

        const current = weatherData.current_weather;
        const weatherMeta = getWeatherMeta(current.weathercode);

        document.getElementById('cityName').innerText = name;
        document.getElementById('countryName').innerText = country || 'Internasional';
        document.getElementById('timezone').innerText = timezone || 'UTC';
        
        document.getElementById('temp').innerText = Math.round(current.temperature);
        document.getElementById('condition').innerText = weatherMeta.label;
        document.getElementById('weatherIcon').innerHTML = `<i class="${weatherMeta.icon}"></i>`;
        document.getElementById('weatherIcon').style.color = weatherMeta.color;

        document.getElementById('windSpeed').innerText = `${current.windspeed} km/j`;
        document.getElementById('windDir').innerText = `${current.winddirection}°`;
        document.getElementById('elevation').innerText = `${elevation ? elevation : 0} m`;
        document.getElementById('coords').innerText = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

        loading.classList.add('hidden');
        resultContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Error fetching weather:", error);
        loading.classList.add('hidden');
        errorContainer.classList.remove('hidden');
    }
}

function getWeatherMeta(code) {
    switch (code) {
        case 0:
            return { label: 'Cerah', icon: 'fa-solid fa-sun', color: '#f59e0b' };
        case 1:
        case 2:
            return { label: 'Cerah Berawan', icon: 'fa-solid fa-cloud-sun', color: '#fbbf24' };
        case 3:
            return { label: 'Berawan Tebal', icon: 'fa-solid fa-cloud', color: '#94a3b8' };
        case 45:
        case 48:
            return { label: 'Berkabut', icon: 'fa-solid fa-smog', color: '#cbd5e1' };
        case 51:
        case 53:
        case 55:
            return { label: 'Gerimis', icon: 'fa-solid fa-cloud-rain', color: '#60a5fa' };
        case 61:
        case 63:
            return { label: 'Hujan Sedang', icon: 'fa-solid fa-cloud-showers-heavy', color: '#3b82f6' };
        case 65:
            return { label: 'Hujan Lebat', icon: 'fa-solid fa-cloud-bounce', color: '#2563eb' };
        case 95:
        case 96:
        case 99:
            return { label: 'Badai Petir', icon: 'fa-solid fa-cloud-bolt', color: '#a855f7' };
        default:
            return { label: 'Berawan', icon: 'fa-solid fa-cloud', color: '#94a3b8' };
    }
}