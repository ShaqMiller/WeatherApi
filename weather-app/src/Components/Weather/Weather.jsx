import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Weather.css';

const Weather = () => {
    const [username, setUsername] = useState('');
    const [userID, setUserID] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [weatherCards, setWeatherCards] = useState([]);
    const [error, setError] = useState('');

    const [showConfirm, setShowConfirm] = useState(false);
    const [zipToDelete, setZipToDelete] = useState(null);


    const navigate = useNavigate();

    useEffect(() => {

        const savedUsername = localStorage.getItem('username');
        const savedUserID = localStorage.getItem('userID');
        const savedLocations = localStorage.getItem('locations');
        
        if (!savedUsername || !savedUserID) {
            navigate('/');
        } else {
            setUsername(savedUsername);
            setUserID(savedUserID);
        }

        let parsedLocations = [];

        try {
            parsedLocations = JSON.parse(savedLocations);
        } catch (err) {
            console.warn('Invalid JSON in localStorage for locations:', savedLocations);
            parsedLocations = [];
        }

        console.log('checking this line:', parsedLocations);
        if (parsedLocations && parsedLocations.length > 0) {
            fetch('http://localhost:5000/api/weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ locations: parsedLocations })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Data is: ', data);
                setWeatherCards(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error)
            });
        }

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

                const newLocation = data.newLocation;

                const newCard = await fetchSingleWeather(newLocation);

                if (newCard) {
                    setWeatherCards(prev => [...prev, newCard]);
                }

                const savedLocations = localStorage.getItem('locations');
                let parsedLocations = [];

                try {
                    parsedLocations = JSON.parse(savedLocations);
                } catch (err) {
                    console.warn('Invalid JSON in localStorage for locations:', savedLocations);
                    parsedLocations = [];
                }

                const updatedLocations = [...parsedLocations, newLocation];
                localStorage.setItem('locations', JSON.stringify(updatedLocations));
            }
            else {
                setError(`Unable To Add: ${data.message || 'Error'}`);
            }
        }
        catch (error) {
            setError("Something went wrong.");
        }
    }

    const fetchSingleWeather = async (location) => {
        try {
            const response = await fetch('http://localhost:5000/api/weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ locations: [location] })
            });
    
            const data = await response.json();

            return data[0];

        } catch (err) {
            console.error('Error fetching single weather:', err);
            return null;
        }
    };

    const handleDelete = async (zipCode) => {

        setShowConfirm(false);
        
        try {
            const response = await fetch('http://localhost:5000/api/deleteLocation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    zipCode: zipCode,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const updatedCards = weatherCards.filter(card => card.zip !== zipCode);
                setWeatherCards(updatedCards);

                const savedLocations = localStorage.getItem('locations');
                let parsedLocations = [];

                try {
                    parsedLocations = JSON.parse(savedLocations);
                } catch (err) {
                    console.warn('Invalid JSON in localStorage for locations:', savedLocations);
                    parsedLocations = [];
                }

                const updatedLocations = parsedLocations.filter(loc => loc.zip !== zipCode);
                localStorage.setItem('locations', JSON.stringify(updatedLocations));
            } else {
                console.error('Error deleting location:', data.message);
            }
        } catch (err) {
            console.error('Error deleteing location:', err);
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
                        <button
                            type='button'
                            className='delete-card-button'
                            onClick={() => {
                                setZipToDelete(card.zip);
                                setShowConfirm(true);
                            }}
                        >
                            X
                        </button>
                        <h3>{card.city}</h3>
                        <p>Weather: {card.precipitation_type} - {card.precipitation_description}</p>
                        <p>Temperature: {card.temperature}°F</p>
                        <p>Feels Like: {card.feels_like}°F</p>
                        <p>Humidity: {card.humidity}%</p>
                        <p>Wind Speed: {card.wind_speed} m/s</p>
                    </div>
                ))}
            </div>

            {showConfirm && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <p>Are you sure you want to delete this location?</p>
                        <div className='modal-buttons'>
                            <button className='confirm-button' onClick={() => handleDelete(zipToDelete)}>Yes</button>
                            <button className='cancel-button' onClick={() => setShowConfirm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Weather;