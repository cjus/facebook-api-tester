// Load the FB SDK Asynchronously
(function(d) {
    var js, id = 'facebook-jssdk';
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "https://connect.facebook.net/en_US/all.js";
    d.getElementsByTagName('head')[0].appendChild(js);
}(document));

var appobj = {};
(function(app) {
    var appName = 'Facebook API Tester';
    var version = '0.1';
    
    app.log = function(obj) {
        if (window.console && window.console.log) {
            window.console.log(obj);
        }
    };

    app.init = function() {
        app.log(appName + ' ' + version);
    };

    app.login = function() {
        FB.login(function(response) {
            if (response.authResponse) {
                app.log('Welcome!  Fetching your information.... ');
                FB.api('/me', function(response) {
                    app.log('Good to see you, ' + response.name + '.');
                });
                app.testAPIs();
            }
            else {
                app.log('User cancelled login or did not fully authorize.');
            }
        }, {
            //scope: 'email, user_likes, friends_likes, publish_actions, publish_stream, user_games_activity, friends_games_activity'
        });
    };

    app.testAPIs = function() {
        //appobj.sendInvite("Join me in seeing this work!", "1200172369, 100002891350086, 107015399372765, 714633001");
        appobj.sendInvite("Join me in seeing this work!", "1200172369");
    };

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
                app.log(response);
            }
        });
    };

})(appobj);

$(document).ready(function() {
    window.fbAsyncInit = function() {
        FB.init({
            appId: 484266044928297, // App ID
            status: true, // check login status
            cookie: true, // enable cookies to allow the server to access the session
            xfbml: true, // parse XFBML
            frictionlessRequests: true
        });
        appobj.init();
        appobj.login();
    };
});
