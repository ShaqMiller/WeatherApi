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

    const [editingZip, setEditingZip] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [zipBeingEdited, setZipBeingEdited] = useState(null);
    const [newZip, setNewZip] = useState('');    

    const navigate = useNavigate();
    const savedUsername = localStorage.getItem('username');
    const savedUserID = localStorage.getItem('userID');
    const savedLocations = localStorage.getItem('locations');
    const token = localStorage.getItem('token');

    useEffect(() => {
        
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

        if (parsedLocations && parsedLocations.length > 0) {
            fetch('http://localhost:5000/api/weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ locations: parsedLocations })
            })
            .then(response => {
                handleAuthError(response.status);
                return response.status === 200 ? response.json() : null;
            })
            .then(data => {
                console.log('Data is: ', data);
                setWeatherCards(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error)
            });
        }

    }, []);

    const handleAuthError = (status) => {
        if (status === 401 || status === 403) {
            console.warn('Token invalid or expired. Logging out.');
            localStorage.clear();
            navigate('/');
        }
    };


    const handleLogout = () => {
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
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(zipCodeData),
            });

            handleAuthError(response.status);

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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ locations: [location] })
            });

            handleAuthError(response.status);
    
            const data = await response.json();

            return data[0];

        } catch (err) {
            console.error('Error fetching single weather:', err);
            return null;
        }
    };

    const handleZipUpdate = async (oldZip) => {
        if (!newZip || newZip.length !== 5 || isNaN(newZip)) {
            setError('Enter a valid new ZIP.');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:5000/api/updateLocation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ username, oldZip, newZip }),
            });
    
            handleAuthError(response.status);
    
            const data = await response.json();
    
            if (data.success) {
                const updatedCard = await fetchSingleWeather(data.updatedLocation);
    
                const updatedCards = weatherCards.map(card =>
                    card.zip === oldZip ? updatedCard : card
                );
    
                setWeatherCards(updatedCards);
    
                const savedLocations = localStorage.getItem('locations');
                let parsedLocations = [];
    
                try {
                    parsedLocations = JSON.parse(savedLocations);
                } catch (err) {
                    console.warn('Invalid JSON in localStorage for locations:', savedLocations);
                    parsedLocations = [];
                }
    
                const updatedLocations = parsedLocations.map(loc =>
                    loc.zip === oldZip ? data.updatedLocation : loc
                );
    
                localStorage.setItem('locations', JSON.stringify(updatedLocations));
    
                setEditingZip(null);
                setError('ZIP code updated successfully!');
            } else {
                setError(data.message);
            }
    
        } catch (err) {
            console.error('Error updating ZIP:', err);
            setError('Something went wrong during update.');
        }
    };    

    const handleDelete = async (zipCode) => {

        setShowConfirm(false);
        
        try {
            const response = await fetch('http://localhost:5000/api/deleteLocation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: username,
                    zipCode: zipCode,
                }),
            });

            handleAuthError(response.status);

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

                        <div className='card-buttons'>
                            <button
                                type='button'
                                className='edit-card-button'
                                onClick={() => {
                                    setZipBeingEdited(card.zip);
                                    setNewZip('');
                                    setShowEditModal(true);
                                }}
                            >
                                ✎
                            </button>

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
                        </div>

                        <h3>{card.city}</h3>
                        <p>Weather: {card.precipitation_type} - {card.precipitation_description}</p>
                        <p>Temperature: {card.temperature}°F</p>
                        <p>Feels Like: {card.feels_like}°F</p>
                        <p>Humidity: {card.humidity}%</p>
                        <p>Wind Speed: {card.wind_speed} m/s</p>
                    </div>
                ))}
            </div>

            {showEditModal && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <p>Enter a new ZIP code to update:</p>
                        <input
                            type="text"
                            value={newZip}
                            onChange={(e) => setNewZip(e.target.value)}
                            placeholder="New ZIP"
                            className="edit-zip-input"
                        />
                        <div className='modal-buttons'>
                            <button
                                className='confirm-button'
                                onClick={() => {
                                    handleZipUpdate(zipBeingEdited);
                                    setShowEditModal(false);
                                }}
                            >
                                Update
                            </button>
                            <button
                                className='cancel-button'
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

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