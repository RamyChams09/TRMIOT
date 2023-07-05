/*global TRMIOT _config*/

var TRM_RoomBooking_API = window.TRM_RoomBooking_API || {};

(function bookScopeWrapper($) {

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


    // Booking
    TRM_RoomBooking_API.bookRoom = function bookRoom() {

        var roomID = document.getElementById('roomSelect').value;
        var booking_date = document.getElementById('date').value;
        var start_time = document.getElementById('start_time').value;
        var end_time = document.getElementById('end_time').value;
      
        // Validate if the selected date and time are in the future
        var currentTime = new Date().getTime();
        var selectedDateTime = new Date(`${booking_date}T${start_time}`).getTime();
      
        if (selectedDateTime < currentTime) {
          alert('Please select a future date and time.');
          return;
        }
      
        var postData = {
            'meetingroomID': roomID,
            'booking_date': booking_date,
            'start_time': start_time,
            'end_time': end_time
        };
      
        TRM_RoomBooking_API.authToken.then(function setAuthToken(token) {
            fetch(_config.api.invokeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(postData)
            })
            .then(function (response) {
                response.json()
                .then(function (responseData) {
                    console.log(responseData);
                    
                    if (response.ok) {
                        alert("Booking was successful. Please refresh the page to see your booking in the summary.");
                    } else {
                        alert(responseData);
                    }
                })
                .catch(function (e) {
                    console.log(e);
                });
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
        });
    }


    // Delete Booking
    TRM_RoomBooking_API.deleteBooking = function deleteBooking() {

        var roomID = document.getElementById('roomSelect').value;
        var booking_date = document.getElementById('date').value;
        var start_time = document.getElementById('start_time').value;
        var end_time = document.getElementById('end_time').value;
        var booking_code = document.getElementById('booking_code').value;
    
        if (booking_code === undefined || booking_code === '') {
        alert('Please write the booking code');
        return;
        }
    
        var postData = {
        'meetingroomID': roomID,
        'booking_date': booking_date,
        'start_time': start_time,
        'end_time': end_time,
        'booking_code': booking_code,
        };
   
        TRM_RoomBooking_API.authToken.then(function setAuthToken(token) {
            fetch(_config.api.invokeUrl + "/deletebooking", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(postData),
            })
            .then(function (response) {
                response.json()
                .then(function (responseData) {
                    console.log(responseData);

                    if (response.ok) {
                        alert("Delete booking was successful. Please refresh the page to see the changed booking summary.");
                    } else {
                        alert(responseData);
                    }
                })
                .catch(function (e) {
                    console.log(e);
                });
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
        });
    }


    // Update booking
    TRM_RoomBooking_API.updateBooking = function updateBooking() {

        var roomID = document.getElementById('roomSelect').value;
        var booking_date = document.getElementById('date').value;
        var start_time = document.getElementById('start_time').value;
        var end_time = document.getElementById('end_time').value;
        var booking_code = document.getElementById('booking_code').value;
    
        if (booking_code === undefined || booking_code === '') {
            alert('Please write the correct booking code');
            return;
        }
    
        var postData = {
            'meetingroomID': roomID,
            'booking_date': booking_date,
            'start_time': start_time,
            'end_time': end_time,
            'booking_code': booking_code,
            'to_address': '<email-address>'
        };
    
        TRM_RoomBooking_API.authToken.then(function setAuthToken(token) {
            fetch(_config.api.invokeUrl + "/updatebooking", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(postData)
            })
            .then(function (response) { 
                response.json()
                .then(function (responseData) {
                    console.log(responseData);
                    if (response.ok) {
                        alert("Booking update was successful. Please refresh the page to see the changed booking summary.");
                    } else {
                        alert(responseData);
                    }
                })
                .catch(function (e) {
                    console.log(e);
                });
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
        });
    }
}(jQuery));
