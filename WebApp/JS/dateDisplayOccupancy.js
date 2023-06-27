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
  getFunction(formattedDate);
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

// Function to get the day of the week
function getDayOfWeek(date) {
  var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}

// Function to be called on button click
function getFunction(date) {
  // The logic here to handle the getFunction() call
  console.log('Calling getFunction() for date:', date);
}