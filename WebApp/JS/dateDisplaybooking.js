/*global TRMIOT _config*/

var TRM_RoomBooking_API = window.TRM_RoomBooking_API || {};

(function dateDisplayBookingScopeWrapper($) {

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
            console.log("The user does not exist or is not logged in.")
            resolve(null);
        }
    });


    // Get the necessary HTML elements
    var previousBtn = document.getElementById('previousBtn');
    var nextBtn = document.getElementById('nextBtn');
    var dateDisplay = document.getElementById('dateDisplay');

    // Initialize the current date
    var currentDate = new Date();

    // Display the current date
    displayDate();

    // Event listener for the Next button
    nextBtn.addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() + 1);
        displayDate();
    });

    // Event listener for the Previous button
    previousBtn.addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() - 1);
        displayDate();
    });


    function displayDate() {
    // Disable the Previous button if it is the current date
        if (isCurrentDate(currentDate)) {
            previousBtn.disabled = true;
        } else {
            previousBtn.disabled = false;
        }

        // Format the date as DD-MM-YYYY
        var formattedDate = formatDate(currentDate);
        dateDisplay.textContent = formattedDate;

        getBooking(formattedDate);
    }

    // Function to check if a date is the current date
    function isCurrentDate(date) {
        var today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // Function to format a date as DD-MM-YYYY
    function formatDate(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        // Add leading zeros if necessary
        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;

        return day + '-' + month + '-' + year;
    }


    // GET FUNCTION
    function getBooking(formattedDate) {

        TRM_RoomBooking_API.authToken.then(function setAuthToken(token) {

            fetch(_config.api.invokeUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            })
            .then(function (response) {
                response.json()
                .then(function (responseData) {
                    // Function to display booking data in the tables
                    var bookingsToday = JSON.parse(responseData)[formattedDate];
                    var userstatus = document.getElementById("userstatus");
                    var dis = bookingsToday[0]['user_status'];
                    var responseHTML = "Welcome: " + dis;
                    userstatus.innerHTML = responseHTML;

                    // Get references to the room tables
                    var room1Table = document.getElementById('room1Table');
                    var room2Table = document.getElementById('room2Table');

                    // Empty Table for new Date
                    room1Table.innerHTML = "";
                    room2Table.innerHTML = "";

                    if (bookingsToday && bookingsToday.length > 0) {
                        for (var i = 0; i < bookingsToday.length; i++) {

                        // if booking was made by me, show the booking code
                            if (bookingsToday[i].booked_by_me) {
                                var row = `<tr>
                                <td>${bookingsToday[i].book_code}</td>`;
                            } else {
                                var row = `<tr>
                                <td></td>`;
                            }
                            row += `
                                <td>${bookingsToday[i].start_time}</td>
                                <td>${bookingsToday[i].end_time}</td>                    
                                </tr>`;

                            // Add the row to the respective table based on room ID
                            if (bookingsToday[i].room_ID === '1') {
                                room1Table.innerHTML += row;
                            } else if (bookingsToday[i].room_ID === '2') {
                                room2Table.innerHTML += row;
                            }
                        }
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
