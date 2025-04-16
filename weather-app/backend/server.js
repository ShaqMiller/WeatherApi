import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------- TO DO ------ //
// mongodb deletes your account if you paste credentials on github
// so ill be putting the 3 parts in a separate file along with the 
// OpenWeatherMap api key

const part1 = process.env.MONGO_USER;
const part2 = process.env.MONGO_PASS;
const part3 = process.env.MONGO_CLUSTER;

const googleClientID = process.env.GOOGLE_CLIENT_ID;
const apiKey = process.env.OPENWEATHER_API_KEY;

const googleClient = new OAuth2Client(googleClientID);

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = process.env.JWT_EXPIRY;

const url = `mongodb+srv://${part1}:${part2}@cluster0.${part3}.mongodb.net/WeatherApp?retryWrites=true&w=majority`;

const client = new MongoClient(url);
client.connect(console.log("mongodb connected"));

// This holds the database, the 'Users' cluster is inside
const dbcurr = client.db('WeatherApp');
// const collectionscurr = await dbcurr.listCollections().toArray();
// console.log(collectionscurr);

app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

// Function to check the JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API for user login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const usersCollection = dbcurr.collection('Users');
        const user = await usersCollection.findOne({ username: username });

        // user doesnt exist
        if (!user) {
            return res.json({ success: false, message: "Invalid Username or Password." });
        }

        // check if password matches the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Username or Password." });
        }

        const token = jwt.sign(
            { userID: user._id, username: user.username },
            jwtSecret,
            { expiresIn: jwtExpiry }
        );

        return res.json({
            success: true,
            token: token,
            username: user.username,
            userID: user._id,
            userLocations: user.locations,
        });
    }
    catch (error) {
        console.log("Error: ", error);
        return res.json({ success: false, message: "Something went wrong. Please try again." });
    }
})

// API for user signup
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const usersCollection = dbcurr.collection('Users');

        // check if username was already taken
        const existingUser = await usersCollection.findOne({ username: username });
        if (existingUser) {
            return res.json({ success: false, message: "Username already taken." });
        }

        // make the salt and hash the password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // make the object
        const newUser = {
            username: username,
            email: email,
            password: hashedPassword,
            locations: []
        };

        // add to the database
        const result = await usersCollection.insertOne(newUser);

        // get the data of the created user in the database
        const createdUser = await usersCollection.findOne({ _id: result.insertedId });

        const token = jwt.sign(
            { userID: createdUser._id, username: createdUser.username },
            jwtSecret,
            { expiresIn: jwtExpiry }
        );

        return res.json({
            success: true,
            token: token,
            message: "User registered successfully!",
            userID: createdUser._id,
            username: createdUser.username,
            userLocations: createdUser.locations,
        });
    }
    catch (error) {
        console.log("Error: ", error);
        return res.json({ success: false, message: "Something went wrong. Please try again." });
    }
});

// API for google login
app.post('/api/google-login', async (req, res) => {
    const { access_token } = req.body;

    try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!userInfoResponse.ok) throw new Error('Failed to fetch user info from Google');

        const payload = await userInfoResponse.json();

        const { sub, name, email } = payload;

        const usersCollection = dbcurr.collection('Users');

        let user = await usersCollection.findOne({ googleId: sub });

        if (!user) {
            const newUser = {
                username: name,
                email: email,
                googleId: sub,
                locations: [],
            };

            const result = await usersCollection.insertOne(newUser);
            user = await usersCollection.findOne({ _id: result.insertedId });
        }

        // Create your own JWT to use in the app
        const token = jwt.sign(
            { userID: user._id, username: user.username },
            jwtSecret,
            { expiresIn: jwtExpiry }
        );

        res.json({
            success: true,
            token,
            userID: user._id,
            username: user.username,
            userLocations: user.locations,
        });

    } catch (error) {
        console.error('Error verifying Google token:', error);
        res.status(400).json({ success: false, message: 'Invalid Google login' });
    }
});

// API to check if valid zip code
app.post('/api/zipcode', authenticateToken, async (req, res) => {
    const {zipCode, username} = req.body;

    if (!zipCode || zipCode.length !== 5 || isNaN(zipCode)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 5-digit ZIP code.' });
    }

    try {
        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},US&appid=${apiKey}`);

        if (response.status === 200) {
            const { name, lat, lon } = response.data;

            const usersCollection = dbcurr.collection('Users');
            
            const user = await usersCollection.findOne({ username: username });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            const alreadyExists = user.locations.some(location => location.zip === zipCode);

            if (alreadyExists) {
                return res.status(400).json( {success: false, message: 'ZIP already added.'});
            }

            if (user.locations.length <= 2) {

                const newLocation = {
                    zip: zipCode,
                    name: name,
                    latitude: lat,
                    longitude: lon,
                }

                user.locations.push(newLocation);

                await usersCollection.updateOne(
                    { username: username },
                    { $set: { locations: user.locations } }
                );

                return res.json({
                    success: true,
                    message: 'ZIP code added.',
                    newLocation: newLocation
                });
            }
            else {

                return res.status(400).json({ success: false, message: 'Exceeded 3 Locations.' });
            }
        }
    }
    catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ success: false, message: 'Invalid ZIP code.' });
        }

        return res.status(500).json({ success: false, message: 'Something went wrong.' });
    }

});

// API for getting weather data (temporarily set to the data below)
console.log("testing the server.js file prior to weather call");
app.post('/api/weather', authenticateToken, async (req, res) => {

    const { locations } = req.body;

    if (locations.length === 0) {
        return res.status(400).json({ success: false, message: 'Empty location list.' });
    }

    try {
        const weatherDataList = [];

        for (const location of locations) {
            const { zip, latitude, longitude } = location;

            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`);

            if (response.status === 200) {
                const weatherData = response.data;

                weatherDataList.push({
                    zip: zip,
                    city: weatherData.name,
                    country: weatherData.sys.country,
                    temperature: weatherData.main.temp,
                    feels_like: weatherData.main.feels_like,
                    wind_speed: weatherData.wind.speed,
                    humidity: weatherData.main.humidity,
                    precipitation_type: weatherData.weather[0].main,
                    precipitation_description: weatherData.weather[0].description,
                    rain_1h: weatherData.rain?.["1h"] ?? 0,
                    sunrise: weatherData.sys.sunrise,
                    sunset: weatherData.sys.sunset
                });
            }
        }

        return res.json(weatherDataList);
    } catch (error) {
        console.error('Error with fetching weather data:', error);
        return res.status(500).json({ success: false, message: 'Failed to get weather data.'});
    }
});

// API to update a user location
app.post('/api/updateLocation', authenticateToken, async (req, res) => {
    const { username, oldZip, newZip } = req.body;

    if (!newZip || newZip.length !== 5 || isNaN(newZip)) {
        return res.status(400).json({ success: false, message: 'Invalid new ZIP code.' });
    }

    try {
        const usersCollection = dbcurr.collection('Users');
        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const zipExists = user.locations.some(loc => loc.zip === newZip);
        if (zipExists) {
            return res.status(400).json({ success: false, message: 'ZIP already exists.' });
        }

        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/zip?zip=${newZip},US&appid=${apiKey}`);
        const { name, lat, lon } = response.data;

        const updatedLocations = user.locations.map(loc => {
            if (loc.zip === oldZip) {
                return {
                    zip: newZip,
                    name: name,
                    latitude: lat,
                    longitude: lon,
                };
            }
            return loc;
        });

        await usersCollection.updateOne(
            { username },
            { $set: { locations: updatedLocations } }
        );

        res.json({
            success: true,
            message: 'ZIP code updated.',
            updatedLocation: {
                zip: newZip,
                name,
                latitude: lat,
                longitude: lon,
            }
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ success: false, message: 'Invalid new ZIP code.' });
        }

        console.error('Error updating ZIP:', error);
        return res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
});

// API to delete a zip code from the user
app.post('/api/deleteLocation', authenticateToken, async (req, res) => {
    const { username, zipCode } = req.body;

    if (!username || !zipCode) {
        return res.status(400).json({ success: false, message: 'Missing username or zipCode' });
    }

    try {
        const usersCollection = dbcurr.collection('Users');

        const user = await usersCollection.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedLocations = user.locations.filter(location => location.zip !== zipCode);

        await usersCollection.updateOne(
            { username: username },
            { $set: { locations: updatedLocations } }
        );

        return res.json({ success: true, message: 'Location deleted' });

    } catch (error) {
        console.error('Error deleting location:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.listen(5000); // start Node + Express server on port 5000
