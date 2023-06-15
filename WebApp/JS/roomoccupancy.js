// Generate random data for demonstration
const labels = ['Room 1', 'Room 2'];
const data = [8, 12];

// Get the canvas element
const canvas = document.getElementById('occupancyChart');

// Create the chart
const chart = new Chart(canvas, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      label: 'Occupancy',
      data: data,
      backgroundColor: 'rgba(75, 192, 192, 0.5)', // Set the bar color
      borderColor: 'rgba(75, 192, 192, 1)', // Set the border color
      borderWidth: 1 // Set the border width
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true // Start the y-axis at 0
      }
    }
  }
});