// Get the necessary HTML elements
var previousBtn = document.getElementById('previousBtn');
var nextBtn = document.getElementById('nextBtn');
var dateDisplay = document.getElementById('dateDisplay');

// Initialize the current date
var currentDate = new Date();

// Display the current date
displayDate();

// Event listener for the Next button
nextBtn.addEventListener('click', function() {
  currentDate.setDate(currentDate.getDate() + 1);
  displayDate();
});

// Event listener for the Previous button
previousBtn.addEventListener('click', function() {
  currentDate.setDate(currentDate.getDate() - 1);
  displayDate();
});

// Function to display the current date
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

  // Call the getFunction()
   GetBooking(formattedDate);
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
function GetBooking(formattedDate) {
  var apiUrl = 'https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/';
      
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
    'end_time': end_time,
  };

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
  

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(function (response) {
        if (response.ok) {
          response.json()
            .then(function (responseData) {
              // Function to display booking data in the tables
              var bookingsToday = JSON.parse(responseData)[formattedDate];
             

              // Get references to the room 1 and room 2 tables
              var room1Table = document.getElementById('room1Table');
              var room2Table = document.getElementById('room2Table');

              // Empty Table for new Date
              room1Table.innerHTML = "";
              room2Table.innerHTML = "";

              if(bookingsToday && bookingsToday.length > 0) {
                for (var i = 0; i < bookingsToday.length; i++) {
                  var row = `<tr>
                    <td>${bookingsToday[i].start_time}</td>
                    <td>${bookingsToday[i].end_time}</td>
                    <td>${bookingsToday[i].booked_by_me}</td>
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
        } else {
          throw new Error('Unable to fetch booking data.');
        }
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  });
}

