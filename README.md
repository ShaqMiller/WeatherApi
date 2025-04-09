# WeatherApi

Note:
To run this app, run the following commands (remove the quotes):

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

AI Usage In This Project:
OpenAI's ChatGPT was utilized for some portions of this assignment.
These areas where AI was used:
+--------------------------------------------------------------------------------------------------------------------------------+

1. When designing the UI of the frontend using React, we used AI to ask for CSS properties to design the pages.
   The prompt were similar to the format of:

"This is our X page, design the CSS so Y properties are situated like Z."

This was employed mostly on the buttons and search bar.
+--------------------------------------------------------------------------------------------------------------------------------+

2. When implementing the Google OAuth, we heavily used AI to get the exact code to check the differences of provided options.
   For example:

"This is our X function to implement Google OAuth, however it has a static button that we can't change the CSS.
How do we change the CSS so that it matches the consistency of our Y button?"
"This is the X code that we have which implements GoogleLogin, what parts do we change so that it uses useGoogleLogin instead."

This was employed for the OAuth login option.
+--------------------------------------------------------------------------------------------------------------------------------+

3. Some portions had errors that we had difficulty debugging, so we passed the area of code to find the issue.
   Cases include:

"The passed X variable is of format Y, we need to pass X to find the user that X data belongs to in the database. What is the
function that can perform this logic."

This was employed in the backend in an attempt to read data in a specific way.
