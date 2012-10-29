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
var FBAPITester = {};
(function(app) {
    var appName = 'Facebook API Tester';
    var version = '0.2';
    var fbAppId = '484266044928297';
    var fbAccessToken = '';
    var fbLoggedInUserAccessToken = '';
    
    // if you have a need to use an application access token then add your 
    // secret id below.  NOTE: DO NOT publicly post this code or otherwise
    // use it in a production setting.
    var fbSecretId = ''; 
    
    app.getFBAppId = function() {
        return fbAppId;
    };
    
    function getFBSecretId() {
        return fbSecretId;
    }
    
    function setFBAccessToken(token) {
        fbAccessToken = token;
    }
    
    function getFBAccessToken() {
        return fbAccessToken;
    }
    
    function setLoggedInUserAccessToken(token) {
        fbLoggedInUserAccessToken = token;
    }
    
    function getLoggedInUserAccessToken() {
        return fbLoggedInUserAccessToken;
    }
    
    // safe logging using console.log() for browsers that don't support it
    function log(obj) {
        if (window.console && window.console.log) {
            window.console.log(obj);
        }
    }

    // display our test app version
    app.init = function() {
        log(appName + ' ' + version);
        if (getFBSecretId() !== '') {
            // get application token
            var url = 'https://graph.facebook.com/oauth/access_token?client_id=' + api.getFBAppId() + 
                      '&client_secret=' + getFBSecretId() + 
                      '&grant_type=client_credentials';
            log('Attempting to retrieve application access token via: ' + url);
            $.ajax({
                url: url,
                type: 'POST',
                success: (function(result) {
                    var preTokenArray = result.split('=');
                    setFBAccessToken(preTokenArray[1]);
                    log("Access Token = [" + getFBAccessToken() + "]");
                })
            });
        }
        preAPITest();
    };

    // prompt user to log into Facebook and accept our test app
    function login() {
        FB.login(function(response) {
            if (response.authResponse) {
                log('Welcome!  Fetching your information.... ');
                setLoggedInUserAccessToken(response.authResponse.accessToken);                
                FB.api('/me', function(response) {
                    log('Good to see you, ' + response.name);
                });    
            }
            else {
                log('User cancelled login or did not fully authorize.');
            }
        }, {
            scope: 'email, user_likes, friends_likes, publish_actions, publish_stream, user_games_activity, friends_games_activity, manage_notifications'
        });
    }

    // before we can test FB APIs let's make sure that the user is logged in
    // otherwise prompt user to log in.
    function preAPITest() {
        handleLogin();
    }
    
    function handleLogin() {
        // Additional init code here
        FB.getLoginStatus(function(response) {
            log('getLoginStatus: ' + JSON.stringify(response));
            if (response.status === 'connected') {
                log('Logged into Facebook, ready to test APIs...');
                setLoggedInUserAccessToken(response.authResponse.accessToken);
                FB.api('/me', function(response) {
                    log('Welcome back, ' + response.name);
                });                    
            }
            else if (response.status === 'not_authorized') {
                // User logged into FB but not authorized
                log('Logged into Facebook, but have not authorized this app.');
                login();
            }
            else {
                // User not logged into FB
                log('Not logged into Facebook, requesting that you log in..');
                login();
            }
        });
    }
    
    // send fb invite(s)
    function sendInvite(message, fb_friends) {
        var obj = {
            method: 'apprequests',
            message: message,
            to: fb_friends
        };
        FB.ui(obj, function(response) {            
            if (!response) {
                log('Unknown error');
            } else if (response.error) {
                log('error: ' + response.error);            
            } else {
                // here we log instructions on how to view the graph node entry
                // and how to later delete it.
                log('GraphAPI Request ID: ' + response.request);
                log('Request stored on FB Graph and viewable at: http://developers.facebook.com/tools/explorer/' + 
                    app.getFBAppId() + 
                    '/?method=GET&path=' + 
                    response.request + '_' + 
                    response.to[0]
                );
                log('To delete the request stored on FB Graph visit: http://developers.facebook.com/tools/explorer/' + 
                    app.getFBAppId() + 
                    '/?method=DELETE&path=' + 
                    response.request + '_' + 
                    response.to[0] + 
                    ' and press the submit button.'
                );                
            }
        });
    }

    // send fb invite(s) using newer notification graph API
    function sendInvite2(message, fb_friend) {
        var url = '/' + fb_friend + 
                  '/notifications?access_token=' + getLoggedInUserAccessToken() + '&href=' +
                  encodeURIComponent('"https://someplace.org/facebook"') + 
                  '&template=' + encodeURIComponent('"' + message + '"') + '&method=post';
        log('Attempting to post invite to: ' + url);
        FB.api(url, function(response) {
            var json = JSON.stringify(response);
            if (response.error) {
                log('Error invite wasn\'t sent: ' + json);
            } else {
                log('Invite sent: ' + json);
            }
        });
    }

    function logout() {
        log('Attempting to logout');
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                FB.logout(function(response) {
                    log('User is now logged out');
                });
            }
        });
    }
            
    // call apis 
    app.testAPIs = function() {
        //sendInvite2('Join me in seeing this work', '1200172369');
        logout();
    };
    
})(FBAPITester);

//
// Let's wait for jQuery to load then call FB.init() to setup our FB application
//
$(document).ready(function() {
    window.fbAsyncInit = function() {
        FB.init({
            appId: FBAPITester.getFBAppId(), // App ID
            status: true, // check login status
            cookie: true, // enable cookies to allow the server to access the session
            xfbml: true, // parse XFBML
            frictionlessRequests: true
        });
        FBAPITester.init();
    };
});

