document.addEventListener('DOMContentLoaded', function() {
  
  var apiURL = 'https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/getoccupancy?room_id=room_2&date=2023-06-26';
  
  function plotGraph(responseData){
    // Sample data for plotting
    var hours = Array.from(Array(24).keys()).map(i => ("0" + (i + 1)).slice(-2) + ":00");

    // Create the chart context
    var ctx = document.getElementById('occupancyChart').getContext('2d');

    // Create the occupancy chart
    var occupancyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: responseData['time'],
        datasets: [{
          label: 'Room 1',
          data: responseData['occupancy'],
          borderColor: '#3498DB',
          borderWidth: 5, // Set the line width
          fill: false
        },
        {
          label: 'Room 2',
          data: responseData['occupancy'],
          borderColor: '#45B8AC',
          borderWidth: 5, // Set the line width
          fill: false
        }]
        
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
              text: 'Time (in hours)'
            }
          }
        },
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  function getUserPool() {
    var poolData = {
      UserPoolId: 'eu-central-1_lpgDFIdQ1', // Replace with your Cognito User Pool ID
      ClientId: '709eu8fla6cpc05b71hgebg8f5', // Replace with your Cognito App Client ID
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    return userPool;
  }
  
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
  
    var apiUrl = 'https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/getoccupancy?room_id=room_1&date=2023-06-26';
  
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
          console.log(responseData['occupancy']);
          plotGraph(responseData);
          alert(JSON.parse(responseData));
          // Update the booking summary UI with the new data
          // plotGraph(responseData);

        })
        .catch(function (e) {
          console.log(e);
        });
      })
      .catch(function(error) {
        console.error('Error:', error);
      });
  });

});

function goToBookingPage() {
  window.location.href = "../HTML/roombooking.html";
}