/*global TRMIOT _config*/

var TRM_RoomBooking_API = window.TRM_RoomBooking_API || {};

(function dateDisplayOccupancyScopeWrapper($) {

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

    nextBtn.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 1);
        displayDate();
    });

    previousBtn.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() - 1);
        displayDate();
    });

    function displayDate() {
        var formattedDate = formatDate(currentDate);
        var dayOfWeek = getDayOfWeek(currentDate);

        dateDisplay.textContent = formattedDate + ' (' + dayOfWeek + ')';
        nextBtn.disabled = isCurrentDate(currentDate);
        getOccupancy(formattedDate);
    }

    function isCurrentDate(date) {
        var today = new Date();
        return date.toDateString() === today.toDateString();
    }

    function formatDate(date) {
        var day = date.getDate().toString().padStart(2, '0');
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var year = date.getFullYear();

        return year + '-' + month + '-' + day;
    }

    function getDayOfWeek(date) {
        var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var dayIndex = date.getDay();
        return daysOfWeek[dayIndex];
    }

    async function plotGraph(responseData, room_id){

        // Create the chart context
        var ctx = document.getElementById('occupancyChart' + room_id).getContext('2d');

        var lineColor;
        if (room_id === '1') {
            lineColor = '#3498DB';
        } else if (room_id === '2') {
            lineColor = '#55B4B0';
        }

        if (room_id === '1') {
            let chartStatus = Chart.getChart("occupancyChart1");
            if (chartStatus != undefined) {
                chartStatus.destroy();
            }

            let chartStatus1 = Chart.getChart("occupancyChart2");
            if (chartStatus1 != undefined) {
                chartStatus1.destroy();
            }
        }
    
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: responseData['time'],
                datasets: [{
                    label: 'Room' + room_id,
                    data: responseData['occupancy'],
                    borderColor: lineColor,
                    borderWidth: 5,
                    fill: false
                }],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Occupancy'
                        }
                    },
                    x: {
                        beginAtZero: true,
                        max: 1440,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    async function getOccupancy(formattedDate) {
        try {
            var token = await TRM_RoomBooking_API.authToken;
            var [data1, data2] = await Promise.all([
                fetch(_config.api.invokeUrl + '/getoccupancy?room_id=room_1&date=' + formattedDate, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                }),
                fetch(_config.api.invokeUrl + '/getoccupancy?room_id=room_2&date=' + formattedDate, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
              }),
            ]);
      
            var [responseData1, responseData2] = await Promise.all([data1.json(), data2.json()]);
            plotGraph(responseData1, '1');
            plotGraph(responseData2, '2');
      
            if (!data1.ok) {
                alert(responseData1);
            }
            if (!data2.ok) {
                alert(responseData2);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}(jQuery));
