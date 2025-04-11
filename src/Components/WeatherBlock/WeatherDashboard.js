import styles from './WeatherDashboard.module.scss';
import Close_SVG from "./close.svg"

function WeatherDashboard({onclose,weatherData}) {
    return (
        <div className={styles.container}>
            {/* Close buyyon */}
            <div className={styles.closeContainer}>
                <img onClick={onclose} src={Close_SVG} className={styles.svgCloseImg} alt="Close" fill="red" />
            </div>

            <div className={styles.locationName}>{weatherData.city}, {weatherData.country}</div>

            <div className={styles.details}>
                <p>Temperature: {weatherData.temperature}°F</p>
                <p>Feels Like: {weatherData.feels_like}°F</p>
                <p>Humidity: {weatherData.humidity}%</p>
                <p>Wind Speed: {weatherData.wind_speed} mph</p>
                <p>Rain (1h): {weatherData.rain_1h} in</p>
                <p>Precipitation: {weatherData.precipitation_type} ({weatherData.precipitation_description})</p>
                <p>Sunrise: {new Date(weatherData.sunrise * 1000).toLocaleTimeString()}</p>
                <p>Sunset: {new Date(weatherData.sunset * 1000).toLocaleTimeString()}</p>
                <p>ZIP Code: {weatherData.zip}</p>
            </div>
        </div>
    );
}

export default WeatherDashboard;
