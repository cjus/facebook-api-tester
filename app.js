
//
// Load the FB SDK Asynchronously
//
(function(d) {
    var js, id = 'facebook-jssdk';
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src = 'https://connect.facebook.net/en_US/all.js';
    d.getElementsByTagName('head')[0].appendChild(js);
}(document));

//
// Package our test framework into a neat object
//
var appobj = {};
(function(app) {
    var appName = 'Facebook API Tester';
    var version = '0.2';
    var fbappid = 484266044928297;
    
    app.getFBAppId = function() {
        return fbappid;
    }
    
    // safe logging using console.log() for browsers that don't support it
    app.log = function(obj) {
        if (window.console && window.console.log) {
            window.console.log(obj);
        }
    };

    // display our test app version
    app.init = function() {
        app.log(appName + ' ' + version);
    };

    // prompt user to log into Facebook and accept our test app
    app.login = function() {
        FB.login(function(response) {
            if (response.authResponse) {
                app.log('Welcome!  Fetching your information.... ');
                FB.api('/me', function(response) {
                    app.log('Good to see you, ' + response.name);
                });    
                app.testAPIs();
            }
            else {
                app.log('User cancelled login or did not fully authorize.');
            }
        }, {
            scope: 'email, user_likes, friends_likes, publish_actions, publish_stream, user_games_activity, friends_games_activity'
        });
    };

    // before we can test FB APIs let's make sure that the user is logged in
    // otherwise prompt user to log in.
    app.preAPITest = function() {
        // Additional init code here
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                app.log('Logged into Facebook, ready to test APIs...');
                app.testAPIs();
            }
            else if (response.status === 'not_authorized') {
                // User logged into FB but not authorized
                app.log('Logged into Facebook, but have not authorized this app.');
                app.login();
            }
            else {
                // User not logged into FB
                app.log('Not logged into Facebook, requesting that you log in..');
                app.login();
            }
        });
    };
    
    // call apis 
    app.testAPIs = function() {
        app.sendInvite('Join me in seeing this work!', '1200172369');
    };

    // send fb invite(s)
    app.sendInvite = function(message, fb_friends) {
        var obj = {
            method: 'apprequests',
            message: message,
            to: fb_friends
        };

        FB.ui(obj, function(response) {            
            if (!response) {
                app.log('Unknown error');
            } else if (response.error) {
                app.log('error: ' + response.error);            
            } else {
                // here we log instructions on how to view the graph node entry
                // and how to later delete it.
                app.log('GraphAPI Request ID: ' + response.request);
                app.log('Request stored on FB Graph and viewable at: http://developers.facebook.com/tools/explorer/' + 
                    app.getFBAppId() + 
                    '/?method=GET&path=' + 
                    response.request + '_' + 
                    response.to[0]
                );
                app.log('To delete the request stored on FB Graph visit: http://developers.facebook.com/tools/explorer/' + 
                    app.getFBAppId() + 
                    '/?method=DELETE&path=' + 
                    response.request + '_' + 
                    response.to[0] + 
                    ' and press the submit button.'
                );                
            }
        });
    };

})(appobj);

//
// Let's wait for jQuery to load then call FB.init() to setup our FB application
//
$(document).ready(function() {
    window.fbAsyncInit = function() {
        FB.init({
            appId: appobj.getFBAppId(), // App ID
            status: true, // check login status
            cookie: true, // enable cookies to allow the server to access the session
            xfbml: true, // parse XFBML
            frictionlessRequests: true
        });
        appobj.init();
        appobj.preAPITest();
    };
});
