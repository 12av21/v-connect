const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('eventId');
const eventRef = firebase.database().ref('events/' + eventId);

// Delete event
eventRef.remove().then(() => {
  alert('Event deleted successfully!');
  window.location.href = 'organizerDashboard.html'; // Redirect to organizer dashboard
}).catch(error => {
  console.error('Error deleting event:', error);
});
