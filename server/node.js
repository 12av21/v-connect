const express = require('express');
const app = express();
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')), // Path to your Firebase service account key
  databaseURL: 'https://your-database-name.firebaseio.com'
});

const db = admin.firestore();

app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files like HTML, CSS, JS

// Endpoint to get events
app.get('/api/events', async (req, res) => {
  const eventsSnapshot = await db.collection('events').get();
  const events = eventsSnapshot.docs.map(doc => doc.data());
  res.json(events);
});

// Endpoint to get volunteers
app.get('/api/volunteers', async (req, res) => {
  const volunteersSnapshot = await db.collection('volunteers').get();
  const volunteers = volunteersSnapshot.docs.map(doc => doc.data());
  res.json(volunteers);
});

// Endpoint for joining an event
app.post('/api/joinEvent', async (req, res) => {
  const { eventId, volunteerId } = req.body;
  await db.collection('eventRequests').add({
    eventId,
    volunteerId,
    status: 'pending'  // Default status is 'pending'
  });
  res.json({ message: 'Join request sent to the organizer.' });
});

// Endpoint to get volunteer profile
app.get('/api/profile/:volunteerId', async (req, res) => {
  const volunteerId = req.params.volunteerId;
  const volunteerDoc = await db.collection('volunteers').doc(volunteerId).get();
  if (!volunteerDoc.exists) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  res.json(volunteerDoc.data());
});

// Endpoint to update volunteer profile
app.post('/api/updateProfile', async (req, res) => {
  const { name, bio } = req.body;
  const volunteerId = 'currentVolunteerId';  // You would use the current user ID here

  await db.collection('volunteers').doc(volunteerId).update({
    name,
    bio
  });
  res.json({ message: 'Profile updated successfully' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Assign points to volunteers & update badges
app.post('/api/volunteer/:volunteerId/assign-points', async (req, res) => {
  const volunteerId = req.params.volunteerId;
  const { points } = req.body;

  const volunteerRef = db.collection('volunteers').doc(volunteerId);
  const volunteerDoc = await volunteerRef.get();

  if (!volunteerDoc.exists) {
      return res.status(404).json({ error: 'Volunteer not found' });
  }

  let totalPoints = (volunteerDoc.data().points || 0) + points;

  // Determine the badge
  let badge = "None";
  if (totalPoints >= 50 && totalPoints < 100) {
      badge = "Bronze";
  } else if (totalPoints >= 100 && totalPoints < 200) {
      badge = "Silver";
  } else if (totalPoints >= 200 && totalPoints <= 500) {
      badge = "Gold";
  }

  // Update Firestore
  await volunteerRef.update({
      points: totalPoints,
      badge: badge
  });

  res.json({ updatedPoints: totalPoints, newBadge: badge });
});
