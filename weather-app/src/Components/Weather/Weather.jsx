import React, { useEffect, useState } from 'react';
import './Weather.css';

const Weather = () => {
    const [username, setUsername] = useState('');
    const [userID, setUserID] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [weatherCards, setWeatherCards] = useState([]);

    let sample_names = [
        {
            "name" : "Florida",
            "precipitation" : "low",
        },
        {
            "name" : "New York",
            "precipitation" : "high",
        },
        {
            "name" : "Texas",
            "precipitation" : "low"
        }

    ]

    useEffect(() => {

        const savedUsername = localStorage.getItem('username');
        const savedUserID = localStorage.getItem('userID');
        
        if (savedUsername) setUsername(savedUsername);
        if (savedUserID) setUserID(savedUserID);

    }, []);

    const handleLogout = () => {
        // TO DO
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
                <p className='search-result'>Testing some random text</p>
                
            </div>

            <div className='weather-cards'>
                {sample_names.map((card, index) => (
                    <div key={index} className='weather-card'>
                        <button type='button' className='delete-card-button'>X</button>
                        <h3>{card.name}</h3>
                        <p>Precipitation: {card.precipitation}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Weather;