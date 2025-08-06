const userTab = document.querySelector("[data-userWeather]");
        const searchTab = document.querySelector("[data-searchWeather]");
        const userContainer = document.querySelector(".weather-container");

        const grantAccessContainer = document.querySelector(".grant-location-container");
        const searchForm = document.querySelector("[data-searchForm]");
        const loadingScreen = document.querySelector(".loading-container");
        const userInfoContainer = document.querySelector(".user-info-container");

        let oldTab = userTab;
        const API_KEY = "8a7ce6c51d24982bfeb7abf37a1ad5bf";
        oldTab.classList.add("current-tab");

        function switchTab(newTab) {
            if (newTab != oldTab) {
                oldTab.classList.remove("current-tab");
                oldTab = newTab;
                oldTab.classList.add("current-tab");

                if (newTab === userTab) {
                    // Switch to Your Weather tab
                    searchForm.classList.remove("active");
                    userInfoContainer.classList.remove("active");
                    getfromSessionStorage();
                } else {
                    // Switch to Search Weather tab
                    grantAccessContainer.classList.remove("active");
                    userInfoContainer.classList.remove("active");
                    searchForm.classList.add("active");
                }
            }
        }

        userTab.addEventListener("click", () => {
            switchTab(userTab);
        });

        searchTab.addEventListener("click", () => {
            switchTab(searchTab);
        });

        // check coordinates from session storage
        function getfromSessionStorage() {
            const localCoordinates = sessionStorage.getItem("user-coordinates");
            if (!localCoordinates) {
                grantAccessContainer.classList.add("active");
            } else {
                const coordinates = JSON.parse(localCoordinates);
                fetchUserWeatherInfo(coordinates);
            }
        }

        async function fetchUserWeatherInfo(coordinates) {
            const { lat, lon } = coordinates;
            // make grant access container invisible
            grantAccessContainer.classList.remove("active");
            loadingScreen.classList.add("active");

            //API CALL 
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );
                const data = await response.json();
                loadingScreen.classList.remove("active");
                userInfoContainer.classList.add("active");
                renderWeatherInfo(data);
            } catch (err) {
                loadingScreen.classList.remove("active");
                console.log(err);
                alert("Error fetching weather data. Please try again.");
            }
        }

        function renderWeatherInfo(weatherInfo) {
            const cityName = document.querySelector("[data-cityName]");
            const countryIcon = document.querySelector("[data-countryIcon]");
            const desc = document.querySelector("[data-weatherDesc]");
            const weatherIcon = document.querySelector("[data-weatherIcon]");
            const temp = document.querySelector("[data-temp]");
            const windSpeed = document.querySelector("[data-windspeed]");
            const humidity = document.querySelector("[data-humidity]");
            const cloudiness = document.querySelector("[data-cloudiness]");

            cityName.innerText = weatherInfo?.name;
            countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
            desc.innerText = weatherInfo?.weather?.[0]?.description;
            weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
            temp.innerText = `${weatherInfo?.main?.temp}°C`;
            windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
            humidity.innerText = `${weatherInfo?.main?.humidity}%`;
            cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        }

        function showPosition(position) {
            const userCoordinates = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
            };

            sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
            fetchUserWeatherInfo(userCoordinates);
        }

        function showError(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert("User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    alert("The request to get user location timed out.");
                    break;
                default:
                    alert("An unknown error occurred.");
                    break;
            }
        }

        const grantAccessButton = document.querySelector("[data-grantAccess]");
        grantAccessButton.addEventListener("click", getLocation);

        const searchInput = document.querySelector("[data-searchInput]");

        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let cityName = searchInput.value;

            if (cityName === "")
                return;
            else 
                fetchSearchWeatherInfo(cityName);
        });

        async function fetchSearchWeatherInfo(city) {
            loadingScreen.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");

            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
                );
                
                if (!response.ok) {
                    throw new Error('City not found');
                }
                
                const data = await response.json();
                loadingScreen.classList.remove("active");
                userInfoContainer.classList.add("active");
                renderWeatherInfo(data);
            } catch (err) {
                loadingScreen.classList.remove("active");
                console.log(err);
                alert("City not found. Please try again with a different city name.");
            }
        }

        // Initialize the app
        getfromSessionStorage();