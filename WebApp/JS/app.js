document.addEventListener('DOMContentLoaded', function() {
  const bookingForm = document.getElementById('bookingForm');
  const summaryRoom = document.getElementById('summaryRoom');
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const roomSelect = document.getElementById('roomSelect');
  const dateInput = document.getElementById('date');
  const inTimeInput = document.getElementById('inTime');
  const outTimeInput = document.getElementById('outTime');

  bookingForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedRoom = roomSelect.value;
    const selectedDate = dateInput.value;
    const selectedInTime = inTimeInput.value;
    const selectedOutTime = outTimeInput.value;

    // Send the booking data to AWS API using fetch or XMLHttpRequest
    const apiUrl = 'https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev';
    const data = {
      room: selectedRoom,
      date: selectedDate,
      inTime: selectedInTime,
      outTime: selectedOutTime
    };

    // Post Request
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(responseData => {
        // Display the booking summary
        summaryRoom.value = selectedRoom;
        summaryDate.value = selectedDate;
        summaryTime.value = `${selectedInTime} - ${selectedOutTime}`;

        // Clear the form inputs
        roomSelect.value = 'room1';
        dateInput.value = '';
        inTimeInput.value = '';
        outTimeInput.value = '';

        // Show the booking summary
        document.getElementById('bookingSummary').style.display = 'block';

        // Update the room summary
        updateRoomSummary(selectedRoom);
      })
      .catch(error => {
        // Handle any errors that occur during the API request
        console.error('Error:', error);
      });
  });

  function updateRoomSummary(roomId) {
    // Replace the URL with your actual API endpoint to fetch room information
    const roomApiUrl = `https://tgjdqpmdj0.execute-api.eu-central-1.amazonaws.com/Dev/${roomId}`;

    fetch(roomApiUrl)
      .then(response => response.json())
      .then(roomData => {
        // Update the room summary with the retrieved data
        // Adjust the following lines based on your room data structure
        summaryRoom.innerHTML = roomData.name;
        // Add more fields as needed
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
});
