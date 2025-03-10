import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------- TO DO ------ //
// mongodb deletes your account if you paste credentials on github
// so ill be putting the 3 parts in a separate file along with the 
// OpenWeatherMap api key


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

        return res.json({
            success: true,
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

        return res.json({
            success: true,
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

// API to check if valid zip code
app.post('/api/zipcode', async (req, res) => {
    const {zipCode, username} = req.body;

    if (!zipCode || zipCode.length !== 5 || isNaN(zipCode)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 5-digit ZIP code.' });
    }

    console.log("the zip code is" + zipCode);

    try {
        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},US&appid=${apiKey}`);

        if (response.status === 200) {

            const usersCollection = dbcurr.collection('Users');
            
            const user = await usersCollection.findOne({ username: username });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            if (user.locations.length <= 2) {

                user.locations.push(zipCode);

                await usersCollection.updateOne(
                    { username: username },
                    { $set: { locations: user.locations } }
                );

                return res.json({ success: true, message: 'ZIP code added.' });
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
app.get('/api/weather', (req, res) => {
    console.log("attempting to get sample locations");
    res.json(sample_locations);
});

app.listen(5000); // start Node + Express server on port 5000

let sample_locations = [
    {
        "name" : "Orlando",
        "weather": [
            {
                "main": "Sunny",
                "description": "no clouds",
            }
        ],
        "precipitation" : "none"
    },
    {
        "name" : "Tampa",
        "weather": [
            {
                "main": "Clouds",
                "description": "scattered clouds",
            }
        ],
        "precipitation" : "drizzle"
    },
    {
        "name" : "Miami",
        "weather": [
            {
                "main": "Cloudy",
                "description": "light clouds",
            }
        ],
        "precipitation" : "low"
    },
]