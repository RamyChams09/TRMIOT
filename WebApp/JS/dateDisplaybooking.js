/*global TRMIOT _config*/

var TRM_RoomBooking_API = window.TRM_RoomBooking_API || {};

(function dateDisplayBookingScopeWrapper($) {

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
            console.log("The user does not exist or is not logged in.")
            resolve(null);
        }
    });

    var previousBtn = document.getElementById('previousBtn');
    var nextBtn = document.getElementById('nextBtn');
    var dateDisplay = document.getElementById('dateDisplay');

    var currentDate = new Date();

    displayDate();

    nextBtn.addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() + 1);
        displayDate();
    });

    previousBtn.addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() - 1);
        displayDate();
    });

    function displayDate() {
        var formattedDate = formatDate(currentDate);

        dateDisplay.textContent = formattedDate;
        previousBtn.disabled = isCurrentDate(currentDate);
        getBooking(formattedDate);
    }

    function isCurrentDate(date) {
        var today = new Date();
        return date.toDateString() === today.toDateString();
    }

    function formatDate(date) {
        var day = date.getDate().toString().padStart(2, '0');
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var year = date.getFullYear();

        return day + '-' + month + '-' + year;
    }

    async function getBooking(formattedDate) {
        try {
            var token = await TRM_RoomBooking_API.authToken;
            var response = await fetch(_config.api.invokeUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            });

            var responseData = await response.json();

            // Function to display booking data in the tables
            var bookingsToday = JSON.parse(responseData)[formattedDate];
            var userstatus = document.getElementById("userstatus");
            var dis = "";

            if (bookingsToday && bookingsToday.length > 0) {
                dis = bookingsToday[0]['user_status'];
            }

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
                    var row = "";
                    if (bookingsToday[i].booked_by_me) {
                        row = `<tr>
                        <td>${bookingsToday[i].book_code}</td>`;
                    } else {
                        row = `<tr>
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
            else {
            // Display a message when there are no bookings for the selected date
            var noBookingsRow = `<tr><td colspan="3">No bookings for the selected date.</td></tr>`;
            room1Table.innerHTML = noBookingsRow;
            room2Table.innerHTML = noBookingsRow;
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
}(jQuery));
