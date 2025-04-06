import styles from './WeatherBlock.module.scss';
import Sun_SVG from "./sun.svg"
import Cloud_SVG from "./cloud.svg"
import Wind_SVG from "./wind.svg"
import Rain_SVG from "./rain.svg"
import ThermometerHot_SVG from "./thermometer_hot.svg"
import ThermometerCold_SVG from "./thermometer_cold.svg"

function WeatherBlock({weatherData,onClick,isCompact,onClose}) {

    const isCold = weatherData.temperature > 55 ? false:true
    return (
        <div onClick={onClick} className={`${styles.container} ${isCompact ? styles.isCompact:""}`} >
            {/* Thermometer */}
            <div className={`${styles.thermometerContainer} ${isCold ? styles.coldTempBanner : styles.warmTempBanner}`} >
                {!isCold ? <img src={ThermometerHot_SVG} className={styles.thermometerSvg} alt="thermometer"/> : <img src={ThermometerCold_SVG} className={styles.thermometerSvg} alt="thermometer"/>}
                <div>{weatherData.temperature} &#176; | Feels like: {weatherData.feels_like} </div>
            </div>

            <div className={styles.topSection}>
                {/* Image */}
                <div className={styles.svgContainer}>
                    {weatherData.description.includes("clear")  && <img src={Sun_SVG} className={styles.svgImg} alt="My SVG" />}
                    {weatherData.description.includes("cloud") && <img src={Cloud_SVG} className={styles.svgImg} alt="My SVG" />}
                    {weatherData.description.includes("wind") && <img src={Wind_SVG} className={styles.svgImg} alt="My SVG" />}
                    {weatherData.description.includes("rain") && <img src={Rain_SVG} className={styles.svgImg} alt="My SVG" />}

                </div>
            </div>
            <div className={styles.nameSection}>
                <div className={styles.locationName}>{weatherData.city}, {weatherData.country}</div>
                <div className={styles.weaterDescriptionText}>{weatherData.description}</div>
            </div>

            <div className={styles.bottomSection}>
                <div onClick={onClose} className={styles.removeText}>Remove</div>
            </div>
        </div>
    );
}

export default WeatherBlock;
