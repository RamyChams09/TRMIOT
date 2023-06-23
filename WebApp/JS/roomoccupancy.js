document.addEventListener('DOMContentLoaded', function() {
  // Sample data for plotting
  var hours = Array.from(Array(24).keys()).map(i => ("0" + (i + 1)).slice(-2) + ":00");
  var room1Occupancy = [2, 4, 6, 6, 7, 8, 8, 8, 8, 7, 6, 6, 6, 6, 4, 4, 3, 0, 3, 3, 3, 2, 1, 0];
  var room2Occupancy = [8, 6, 4, 3, 4, 5, 4, 4, 4, 3, 2, 2, 2, 3, 4, 5, 6, 7, 6, 6, 6, 5, 4, 3];

  // Create the chart context
  var ctx = document.getElementById('occupancyChart').getContext('2d');

  // Create the occupancy chart
  var occupancyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: 'Room 1',
        data: room1Occupancy,
        borderColor: '#3498DB',
        borderWidth: 5, // Set the line width
        fill: false
      },
      {
        label: 'Room 2',
        data: room2Occupancy,
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
          max: 24,
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
});