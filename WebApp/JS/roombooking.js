/*global TRMIOT _config*/

var TRM_RoomBooking_API = window.TRM_RoomBooking_API || {};

(function bookScopeWrapper($) {

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    if (!(_config.cognito.userPoolId &&
        _config.cognito.userPoolClientId &&
        _config.cognito.region)) {
      $('#noCognitoMessage').show();
      return;
    }

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

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

    function generateTimeIntervals() {
        var startTimeSelect = document.getElementById('start_time');
        var endTimeSelect = document.getElementById('end_time');

        startTimeSelect.innerHTML = '';
        endTimeSelect.innerHTML = '';

        var startTime = new Date().setHours(0, 0, 0, 0);
        var endTime = new Date().setHours(24, 0, 0, 0);

        var currentTime = startTime;

        while (currentTime <= endTime) {
            var timeValue = new Date(currentTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
 
            var timeParts = timeValue.split(':');

            if(timeParts[0] === '24'){
                timeParts[0] = '00';
            }

            var formattedTime = timeParts.join(':');

            var optionElement = document.createElement('option');
            optionElement.value = formattedTime;
            optionElement.text = formattedTime;

            startTimeSelect.appendChild(optionElement);
            endTimeSelect.appendChild(optionElement.cloneNode(true)); // Add the same option to end time

            currentTime += 30 * 60 * 1000; // Add 30 minutes to the current time
        }
        // Default values
        startTimeSelect.value = '07:00';
        endTimeSelect.value = '20:00';
    }

    generateTimeIntervals();

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
        });//displayDate();
    }

    // Delete Booking
    TRM_RoomBooking_API.deleteBooking = function deleteBooking() {

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
