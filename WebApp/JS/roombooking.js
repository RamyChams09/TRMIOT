function bookRoom() {
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


    // POST FUNCTION
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(postData),
    })
      .then(function (response) {
        response.json()
          .then(function (responseData) {
            console.log(responseData);
            if (response.ok) {
              alert("Booking successful. Please refresh the page to see your booking in the summary");
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



// DELETE FUNCTION
function DeleteBooking() {
  var apiUrl = 'https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/deletebooking';

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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(postData),
    })
      .then(function (response) {
        response.json()
          .then(function (responseData) {
            console.log(responseData);
            if (response.ok) {
              alert("Booking remove successful. Please refresh the page to see the change");
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



