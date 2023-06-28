// Get the necessary HTML elements
var previousBtn = document.getElementById('previousBtn');
var nextBtn = document.getElementById('nextBtn');
var dateDisplay = document.getElementById('dateDisplay');

// Initialize the current date
var currentDate = new Date();

// Display the current date and day
displayDate();

// Event listener for the Next button
nextBtn.addEventListener('click', function() {
  // Update the currentDate for the next day
  currentDate.setDate(currentDate.getDate() + 1);
  displayDate();
});

// Event listener for the Previous button
previousBtn.addEventListener('click', function() {
  // Update the currentDate for the previous day
  currentDate.setDate(currentDate.getDate() - 1);
  displayDate();
});

// Function to display the current date and day
function displayDate() {
  // Format the date as DD-MM-YYYY
  var formattedDate = formatDate(currentDate);
  dateDisplay.textContent = formattedDate;

  // Get the day of the week
  var dayOfWeek = getDayOfWeek(currentDate);
  dateDisplay.textContent += ' (' + dayOfWeek + ')';

  // Enable the Next button
  nextBtn.disabled = false;

  // Check if it is the current date and disable the Next button
  if (isCurrentDate(currentDate)) {
    nextBtn.disabled = true;
  }

  // Call the getFunction()
  getOccupancy(formattedDate);
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

  return year + '-' + month + '-' + day;
}

// Function to get the day of the week
function getDayOfWeek(date) {
  var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}


function plotGraph(responseData, room_id){
  // Sample data for plotting
  var hours = Array.from(Array(24).keys()).map(i => ("0" + (i + 1)).slice(-2) + ":00");

  // Create the chart context
  var ctx = document.getElementById('occupancyChart' + room_id).getContext('2d');

   // Set the line color based on room_id
  var lineColor;
    if (room_id === '1') {
      lineColor = '#3498DB'; // Blue for room 1
    } else if (room_id === '2') {
      lineColor = '#55B4B0'; // Green for room 2
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
  
  // Create the occupancy chart
  var occupancyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: responseData['time'],
      datasets: [{
        label: 'Room' + room_id,
        data: responseData['occupancy'],
        borderColor: lineColor, // Set the line color
        borderWidth: 5, // Set the line width
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
  //occupancyChart.destroy();
}

function getOccupancy(formattedDate) {

var poolData = {
  UserPoolId: 'eu-central-1_lpgDFIdQ1', // Replace with your Cognito User Pool ID
  ClientId: '709eu8fla6cpc05b71hgebg8f5', // Replace with your Cognito App Client ID
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

if (typeof AWSCognito !== 'undefined') {
  AWSCognito.config.region = 'eu-central-1';
}

var authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
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
        console.log("we have no user")
        resolve(null);
    }
});

authToken.then(function setAuthToken(token) {


  var apiUrl = 'https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/getoccupancy?room_id=room_1&date=' + formattedDate;

  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  })
    .then(function(data) {
      data.json()
      .then(function (responseData) {
        plotGraph(responseData, '1');
        if (!data.ok) {
          alert(responseData);
      }

      })
      .catch(function (e) {
        console.log(e);
      });
    })
    .catch(function(error) {
      console.error('Error:', error);
    });


var apiUrl = 'https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/getoccupancy?room_id=room_2&date=' + formattedDate;

  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  })
    .then(function(data) {
      data.json()
      .then(function (responseData) {
        plotGraph(responseData, '2');
        if (!data.ok) {
          alert(responseData);
      }

      })
      .catch(function (e) {
        console.log(e);
      });
    })
    .catch(function(error) {
      console.error('Error:', error);
    });
  });

}