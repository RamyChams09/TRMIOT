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
    // 'employeeID': 'Jessica',
  };

  console.log(postData);

  var poolData = {
    UserPoolId: 'eu-central-1_lpgDFIdQ1', // Replace with your Cognito User Pool ID
    ClientId: '709eu8fla6cpc05b71hgebg8f5', // Replace with your Cognito App Client ID
  };

  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  console.log(`our user pool: ${userPool}`)

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
    console.log(token);

    // Post Function
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(postData),
    })
      .then(function (response) {
        if (response.ok) {
          response.json()
            .then(function (responseData) {
              console.log(responseData);
              alert(JSON.parse(responseData));
              // Update the booking summary UI with the new data
            })
            .catch(function (e) {
              console.log(e);
            });
        } else {
          throw new Error('Unable to create booking, please check booking details.');
        }
      })
      .catch(function (error) {
        console.error('Error:', error);
      });

    // Get Function
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(function (response) {
        if (response.ok) {
          response.text()
            .then(function (responseData) {
              console.log(responseData);
              var parsedData = JSON.parse(responseData);
              // Use the parsedData for further processing
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


      /*
      // Delete Function
      function DeleteBooking() {
        var apiUrl = 'https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/';
        
        var roomID = document.getElementById('roomSelect').value;
        var booking_date = document.getElementById('date').value;
        var start_time = document.getElementById('start_time').value;
        var end_time = document.getElementById('end_time').value;
      
      
        var postData = {
          'meetingroomID': roomID,
          'booking_date': booking_date,
          'start_time': start_time,
          'end_time': end_time,
          // 'employeeID': 'Jessica',
        };
      
        console.log(postData);
      
        var poolData = {
          UserPoolId: 'eu-central-1_lpgDFIdQ1', // Replace with your Cognito User Pool ID
          ClientId: '709eu8fla6cpc05b71hgebg8f5', // Replace with your Cognito App Client ID
        };
      
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        console.log(`our user pool: ${userPool}`)
      
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
          console.log(token);
      
      fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      })
        .then(function (response) {
          if (response.ok) {
            console.log('Booking canceled. Please refresh the page');
            // Update the booking summary UI or perform any other necessary actions
          } else {
            throw new Error('Unable to cancel booking.');
          }
        })
        .catch(function (error) {
          console.error('Error:', error);
        });

      });

    }

    */

        

