facebook-api-tester
===================

Simple testrig for testing FB APIs.
To test follow these steps

.1 Obtain a facebook app id by creating a new app on facebook or supplying your
   own app ID.
.2 Point your facebook app to the location where you're hosting this api tester
.3 Supply the appId to the FB.init call in app.js
.4 Load the index.html via your hosted URL.

Once loaded, open Firebug or developer tools and activate the JavaScript console.

On the console you have access to a newly created FBAPITester object. You can use 
that object to invoke public functions such as FBAPITester.testAPIs();


