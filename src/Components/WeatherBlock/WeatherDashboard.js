import styles from './WeatherDashboard.module.scss';
import Close_SVG from "./close.svg"

function WeatherDashboard({onclose,weatherData}) {
    return (
        <div className={styles.container}>
            {/* Close buyyon */}
            <div className={styles.closeContainer}>
                <img onClick={onclose} src={Close_SVG} className={styles.svgCloseImg} alt="Close" fill="red" />
            </div>

            <div className={styles.locationName}>{weatherData.locationName}</div>
        </div>
    );
}

export default WeatherDashboard;
