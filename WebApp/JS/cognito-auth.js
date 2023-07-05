/*global TRMIOT _config AmazonCognitoIdentity AWSCognito*/

var TRM_RoomBooking_API = window.TRM_RoomBooking_API || {};

(function scopeWrapper($) {
    var signinURL = "signin.html";
    var verifyURL = "verify.html";
    var roombookingURL = "roombooking.html";
    var resetPasswordURL = "resetpassword.html";

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    TRM_RoomBooking_API.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
        alert("You have been signed out.");
        window.location.href = signinURL;
    };

    TRM_RoomBooking_API.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });

    
    /*
     * Cognito User Pool functions
     */

    function register(email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };

        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(email, password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }
    
    function requestCodeToResetPassword(email){
        var cognitoUser = createCognitoUser(email);

        cognitoUser.forgotPassword({
            onSuccess: function(){
                console.log("Successfully initiated password resetting");
                window.location.href = resetPasswordURL;
            },
            onFailure: function(err){
                alert(err.message || JSON.stringify(err));
            }
        });
    }

    TRM_RoomBooking_API.requestCodeToResetPassword = requestCodeToResetPassword;

    function resetPassword(email, code, password){
        var cognitoUser = createCognitoUser(email);

        cognitoUser.confirmPassword(code, password, {
            onSuccess: function(){
                console.log("Successfully reset the password");
            },
            onFailure: function(err){
                alert(err.message || JSON.stringify(err));
            }
        });
    }

    TRM_RoomBooking_API.resetPassword = resetPassword;
    

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
        $('#forgotPasswordForm').submit(handleForgotPassword);
        $('#resetPasswordForm').submit(handleResetPassword);
    });

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function handleSignin(event) {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();

        event.preventDefault();

        signin(email, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = roombookingURL;
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = verifyURL;
            }
        };

        var onFailure = function registerFailure(err) {
            alert(err);
        };

        event.preventDefault();

        if (password === password2) {
            register(email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();

        event.preventDefault();

        verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the sign in page.');
                window.location.href = signinURL;
            },
            function verifyError(err) {
                alert(err);
            }
        );

        signin(email, newPassword,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = roombookingURL;
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleForgotPassword(event) {
        var email = $('#emailInputSignin').val();
        event.preventDefault();
        TRM_RoomBooking_API.requestCodeToResetPassword(email);
    }

    function handleResetPassword(event){
        var email = $('#emailInputSignin').val();
        var code = $('#codeInputVerify').val();
        var password = $('#passwordInputRegister').val();
        var confirmPassword = $('#password2InputRegister').val();

        event.preventDefault();

        if(password !== confirmPassword){
            alert('Passwords do not match');
            return;
        }
        TRM_RoomBooking_API.resetPassword(email, code, password);

        signin(email, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = roombookingURL;
            },
            function signinError(err) {
                alert(err);
            }
        );
    }
}(jQuery));
