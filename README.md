# WeatherApi

=================================NOTE================================
Parts of the code in the server.js were removed. These codes consisted of things such as
MongoDB url link and API keys. As such, the server.js will not work in the file state.

To run this app, navigate to weather-app. Then run the following commands (remove the quotes):

"npm install express body-parser cors mongodb bcryptjs axios jsonwebtoken google-auth-library"

The above command includes the following packages:
Express
Body Parser
CORS
MongoDB
Bcrypt.js
Axios
JSON Web Token
Google Auth Library

Once the packages are installed, run the command (remove the quotes):

"npm start"

Then navigate to weather-app/backend, then run the command (remove the quotes):

"nodemon server.js"

If using localhost to deploy this application, port 3000 would likely be used for the frontend
with the backend Express server on port 5000.

AI Usage In This Project:
OpenAI's ChatGPT was utilized for some portions of this assignment. The ChatGPT model was 4o.
Some portions include:
+---------------------------------------------------------------------------------------------+

1. When designing the UI of the frontend using React, we used AI to ask for CSS properties to
   design the pages. The prompt were similar to the format of:

"This is our X page, design the CSS so Y properties are situated like Z."

This was employed mostly on the buttons and search bar.
+---------------------------------------------------------------------------------------------+

2. When implementing the Google OAuth, we heavily used AI to get the exact code to check the
   differences of provided options. For example:

"This is our X function to implement Google OAuth, however it has a static button that we can't
change the CSS. How do we change the CSS so that it matches the consistency of our Y button?"
"This is the X code that we have which implements GoogleLogin, what parts do we change so that
it uses useGoogleLogin instead."

This was employed for the OAuth login option.
+---------------------------------------------------------------------------------------------+

3. Some portions had errors that we had difficulty debugging, so we passed the area of code to
   find the issue. Cases include:

"The passed X variable is of format Y, we need to pass X to find the user that X data belongs
to in the database. What is the function that can perform this logic."

This was employed in the backend in an attempt to read data in a specific way.

+---------------------------------------------------------------------------------------------+

These are just some of the prompts but most of the prompts followed the formats above. The
files of the application affected by AI include:

LoginRegister.jsx
LoginRegister.css
Weather.jsx
Weather.css
server.js
