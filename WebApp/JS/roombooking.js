 //const form = document.querySelector('form')
    //form.addEventListener('submit', accessAPI);
    
    //var roomID = document.getElementById('roomSelect').value;
    
    function accessAPI() {
      var apiUrl = 'https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/';
      
      var roomID = document.getElementById('roomSelect');
      var selected_room = roomID.options[roomID.selectedIndex].value;
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
        'meetingroomID': selected_room,
        'booking_date': booking_date,
        'start_time': start_time,
        'end_time': end_time,
        'employeeID': 'Jessica',
      }

      console.log(postData)

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // new Header with the cognito authentication token 
        },
        body: JSON.stringify(postData)
      })
        .then(function(response) {
          return response.json();
        })
          .then(function(data) {
            console.log(data);
          })
          .catch(function(error) {
            console.error('Error:', error);
          });
    }