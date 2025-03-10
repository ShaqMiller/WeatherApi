import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Weather.css';

const Weather = () => {
    const [username, setUsername] = useState('');
    const [userID, setUserID] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [weatherCards, setWeatherCards] = useState([]);
    const [error, setError] = useState('');

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

    const handleSearch = async (e) => {
        e.preventDefault();

        const zipCode = searchQuery.trim();

        if (!zipCode || zipCode.length !== 5 || isNaN(zipCode)) {
            setError('Please enter a valid 5-digit ZIP code.');
            return;
        }

        setError('');

        const zipCodeData = {
            zipCode: zipCode,
            username: username,
        };

        try {
            const response = await fetch('http://localhost:5000/api/zipcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(zipCodeData),
            });

            const data = await response.json();

            if (data.success) {
                setSearchQuery('');
                setError('Added ZIP Code');
            }
            else {
                setError("Unable To Add More");
            }
        }
        catch (error) {
            setError("Something went wrong.");
        }
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
                    placeholder='Search ZIP...' 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className='search-input' 
                />
                <button 
                    type='button' 
                    className='search-button' 
                    onClick={handleSearch}
                >
                    Add
                </button>
                {error && <p className='search-result'>{error}</p>}
                
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