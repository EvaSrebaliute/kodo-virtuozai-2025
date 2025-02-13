import React, { useState, useEffect } from "react";
import './App.css'; // Import the CSS file

// Function to fetch forecast data for a selected place
async function fetchForecastData(placeCode) {
  const proxyUrl = "https://thingproxy.freeboard.io/fetch/";
  const targetUrl = `https://meteoapi.vercel.app/v1/places/${placeCode}/forecasts/long-term`;
  console.log("Fetching forecast from:", proxyUrl + targetUrl);
  
  try {
    const response = await fetch(proxyUrl + targetUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    throw error;
  }
}

function App() {
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Fetch list of places
  useEffect(() => {
    fetch("https://meteoapi.vercel.app/v1/places")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch places");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched places:", data);
        setPlaces(data);
        setLoadingPlaces(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoadingPlaces(false);
      });
  }, []);

  // Function to fetch forecast data for a selected place
  const fetchForecast = async (placeCode) => {
    if (!placeCode) {
      setError("Place code is missing!");
      return;
    }

    console.log("Fetching forecast for place code:", placeCode);
    setLoadingForecast(true);
    try {
      const data = await fetchForecastData(placeCode); // Pass placeCode here
      setForecast(data);
      console.log("Forecast data successfully fetched", data);
    } catch (error) {
      setError("Error fetching forecast data");
      console.error("Error fetching forecast:", error);
    } finally {
      setLoadingForecast(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Lithuania Weather</h1>
      <img className="image" src="icon1.png"></img>
      {error && <p className="error">{error}</p>}

      {loadingPlaces ? (
        <p className="loading">Loading places...</p>
      ) : (
        <div>
          <h2 className="subtitle">Select a City:</h2>
          <select
            className="places-dropdown"
            onChange={(e) => {
              const placeCode = e.target.value;
              console.log("Dropdown selected place code:", placeCode); // Log the placeCode when selected
              const selectedPlace = places.find(place => place.code === placeCode);
              setSelectedPlace(selectedPlace);
              fetchForecast(placeCode); // Pass place.code to the function
            }}
          >
            <option value="">Select a city</option>
            {places.map((place) => (
              <option key={place.code} value={place.code}>
                {place.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loadingForecast && <p className="loading">Loading forecast...</p>}

      {forecast && selectedPlace && (
        <div className="forecast">
          <h2 className="forecast-title">Weather in {selectedPlace.name}</h2>
          {forecast.forecastTimestamps &&
          forecast.forecastTimestamps.length > 0 ? (
            <div className="forecast-details">
              <p>
                Temperature: {forecast.forecastTimestamps[0].airTemperature}°C
              </p>
              <p>Condition: {forecast.forecastTimestamps[0].conditionCode}</p>
            </div>
          ) : (
            <p>No forecast data available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
