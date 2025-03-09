import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Weather.css';

const Weather = () => {
    const [username, setUsername] = useState('');
    const [userID, setUserID] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [weatherCards, setWeatherCards] = useState([]);

    let sample_names = [
        "Orlando",
        "Tampa",
        "Miami",
    ]

    const navigate = useNavigate();

    useEffect(() => {

        const savedUsername = localStorage.getItem('username');
        const savedUserID = localStorage.getItem('userID');
        const savedLocations = localStorage.getItem('userLocations');
        
        if (!savedUsername || !savedUserID) {
            navigate('/');
        } else {
            setUsername(savedUsername);
            setUserID(savedUserID);
        }


        fetch('http://localhost:5000/api/weather')
        .then(response => response.json())
        .then(data => {
            setWeatherCards(data);
        })
        .catch(error => console.error('Error fetching weather data:', error));

    }, []);

    const handleLogout = () => {
        // Clear out the local storage
        localStorage.clear();

        navigate('/');
    }

    const handleSearch = () => {
        // TO DO
    }

    const addCard = () => {
        if (weatherCards.length < 3) {
            const newCard = sample_names[weatherCards.length]; 
            setWeatherCards([...weatherCards, newCard]);
        }
    }

    return (
        <div>
            <div className='navigation-bar'>
                <h1>Welcome, {username}!</h1>

                <button type='button' className='logout-button' onClick={handleLogout}>Logout</button>
            </div>

            <div className='search-bar'>
                <input 
                    type='text' 
                    placeholder='Search...' 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className='search-input' 
                />
                <button 
                    type='button' 
                    className='search-button' 
                    onClick={handleSearch}
                >
                    Find
                </button>
                <p className='search-result'></p>
                
            </div>

            <div className='weather-cards'>
                {weatherCards.map((card, index) => (
                    <div key={index} className='weather-card'>
                        <button type='button' className='delete-card-button'>X</button>
                        <h3>{card.name}</h3>
                        <p>Weather: {card.weather[0].main} - {card.weather[0].description}</p>
                        <p>Precipitation: {card.precipitation}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Weather;