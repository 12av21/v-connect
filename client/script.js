document.addEventListener("DOMContentLoaded", function() {
  // Example: Switching between sections in the sidebar
  const navLinks = document.querySelectorAll('.dashboard-nav a');
  const sections = document.querySelectorAll('.section');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      sections.forEach(section => section.style.display = 'none');
      const targetSection = document.querySelector(link.getAttribute('href'));
      targetSection.style.display = 'block';
    });
  });
  
  // By default, show the profile section
  document.querySelector('#profile').style.display = 'block';
});
// Signup Functionality
document.getElementById("signup-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User successfully signed up
      const user = userCredential.user;
      // Store additional user data in the database
      db.ref('users/' + user.uid).set({
        email: user.email,
        role: 'volunteer', // Set default role as volunteer
        points: 0,
        badges: []
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

// Login Functionality
document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User logged in
      const user = userCredential.user;
      window.location.href = '/volunteer-dashboard.html';  // Redirect to dashboard
    })
    .catch((error) => {
      console.error(error);
    });
});
window.onload = function() {
  const eventsRef = db.ref("events");
  eventsRef.on("value", function(snapshot) {
    const events = snapshot.val();
    const eventList = document.querySelector(".event-list");

    eventList.innerHTML = "";  // Clear any existing events

    // Loop through each event and create event cards
    for (let key in events) {
      const event = events[key];
      const eventCard = document.createElement("div");
      eventCard.classList.add("event-card");
      eventCard.innerHTML = `
        <h4>${event.title}</h4>
        <p>${event.description}</p>
        <p><strong>Date:</strong> ${event.date}</p>
        <button class="btn" data-event-id="${key}">Join Event</button>
      `;
      eventList.appendChild(eventCard);
    }

    // Add event listener to buttons
    document.querySelectorAll(".event-card button").forEach(button => {
      button.addEventListener("click", function() {
        const eventId = this.getAttribute("data-event-id");
        joinEvent(eventId);  // Function to join event
      });
    });
  });
}

// Function to join an event
function joinEvent(eventId) {
  const user = auth.currentUser;
  if (user) {
    const volunteerRef = db.ref("users/" + user.uid);
    volunteerRef.once("value").then(function(snapshot) {
      const volunteer = snapshot.val();
      const points = volunteer.points + 10;  // Earn points for joining event
      volunteerRef.update({ points });

      // Add a badge if points exceed a certain threshold
      let badges = volunteer.badges || [];
      if (points >= 100 && !badges.includes('Gold')) {
        badges.push('Gold');
      }
      volunteerRef.update({ badges });

      alert("You have successfully joined the event and earned 10 points!");
    });
  } else {
    alert("Please log in to join events.");
  }
}
// Fetching profile information
window.onload = function () {
  const user = firebase.auth().currentUser;
  if (user) {
    const userRef = firebase.database().ref("users/" + user.uid);
    userRef.once("value", (snapshot) => {
      const userData = snapshot.val();
      document.getElementById("user-email").textContent = userData.email;
      document.getElementById("user-points").textContent = userData.points;
      document.getElementById("user-badges").textContent = userData.badges.join(", ") || "No badges earned yet.";
    });
  } else {
    window.location.href = '/login.html'; // Redirect to login if user is not authenticated
  }

  // Logout functionality
  document.getElementById("logout-btn").addEventListener("click", function () {
    firebase.auth().signOut().then(() => {
      window.location.href = '/login.html';  // Redirect to login page
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  });
};
window.onload = function () {
  const user = firebase.auth().currentUser;
  if (user) {
    const userRef = firebase.database().ref("users/" + user.uid);
    userRef.once("value", (snapshot) => {
      const userData = snapshot.val();
      document.getElementById("user-email").textContent = userData.email;
      document.getElementById("user-points").textContent = userData.points;
      document.getElementById("user-badges").textContent = userData.badges.join(", ") || "No badges earned yet.";

      // Display joined events
      const joinedEventsList = document.getElementById("joined-events-list");
      joinedEventsList.innerHTML = ""; // Clear any existing events

      const joinedEvents = userData.joined_events || {};
      for (let eventId in joinedEvents) {
        const event = joinedEvents[eventId];
        const eventItem = document.createElement("li");
        eventItem.textContent = `${event.title} - Earned Points: ${event.points}`;
        joinedEventsList.appendChild(eventItem);
      }
    });
  } else {
    window.location.href = '/login.html';  // Redirect to login if user is not authenticated
  }

  // Logout functionality
  document.getElementById("logout-btn").addEventListener("click", function () {
    firebase.auth().signOut().then(() => {
      window.location.href = '/login.html';  // Redirect to login page
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  });
};

//notification 
function joinEvent(eventId) {
  const user = firebase.auth().currentUser;
  if (user) {
    const volunteerRef = firebase.database().ref("users/" + user.uid);
    volunteerRef.once("value").then(function(snapshot) {
      const volunteer = snapshot.val();
      const points = volunteer.points + 10;  // Earn points for joining event
      volunteerRef.update({ points });

      // Add a badge if points exceed a certain threshold
      let badges = volunteer.badges || [];
      if (points >= 100 && !badges.includes('Gold')) {
        badges.push('Gold');
      }
      volunteerRef.update({ badges });

      // Show notification
      const notification = document.getElementById("notification");
      notification.textContent = `You have successfully joined the event and earned 10 points!`;
      notification.style.display = "block";
      setTimeout(function() {
        notification.style.display = "none";
      }, 3000);
    });
  } else {
    alert("Please log in to join events.");
  }
}

//fetching displaying events
// Fetch and display events on the Volunteer Dashboard
window.onload = function () {
  const user = firebase.auth().currentUser;
  if (user) {
    const eventsRef = firebase.database().ref("events");
    eventsRef.once("value", function(snapshot) {
      const eventsContainer = document.getElementById("events-container");
      eventsContainer.innerHTML = ""; // Clear any existing events

      snapshot.forEach(function(childSnapshot) {
        const event = childSnapshot.val();
        const eventId = childSnapshot.key;
        
        const eventCard = document.createElement("div");
        eventCard.classList.add("event-card");

        eventCard.innerHTML = `
          <h4>${event.title}</h4>
          <p>${event.description}</p>
          <p>Date: ${event.date}</p>
          <p>Points: ${event.points}</p>
          <button class="join-btn" data-event-id="${eventId}">Join Event</button>
        `;
        eventsContainer.appendChild(eventCard);
      });

      // Add event listener for joining events
      const joinButtons = document.querySelectorAll(".join-btn");
      joinButtons.forEach((button) => {
        button.addEventListener("click", function() {
          const eventId = button.getAttribute("data-event-id");
          joinEvent(eventId);
        });
      });
    });
  } else {
    window.location.href = '/login.html';  // Redirect to login if user is not authenticated
  }
};

// Join event function
function joinEvent(eventId) {
  const user = firebase.auth().currentUser;
  if (user) {
    const volunteerRef = firebase.database().ref("users/" + user.uid);
    const eventsRef = firebase.database().ref("events/" + eventId);
    
    // Update user profile with the event they joined
    volunteerRef.once("value").then(function(snapshot) {
      const volunteer = snapshot.val();
      const points = volunteer.points + 10;  // Earn points for joining the event
      volunteerRef.update({ points });

      // Add the event to the user's joined events
      volunteerRef.child("joined_events").child(eventId).set({
        title: eventsRef.child("title").val(),
        points: 10
      });

      // Show notification
      const notification = document.getElementById("notification");
      notification.textContent = `You have successfully joined the event and earned 10 points!`;
      notification.style.display = "block";
      setTimeout(function() {
        notification.style.display = "none";
      }, 3000);
    });
  } else {
    alert("Please log in to join events.");
  }
}

//badge assignment 
function updateBadges(volunteerRef) {
  volunteerRef.once("value").then(function(snapshot) {
    const volunteer = snapshot.val();
    let badges = volunteer.badges || [];

    // Assign badges based on points
    if (volunteer.points >= 100 && !badges.includes('Gold')) {
      badges.push('Gold');
    } else if (volunteer.points >= 50 && !badges.includes('Silver')) {
      badges.push('Silver');
    } else if (volunteer.points >= 20 && !badges.includes('Bronze')) {
      badges.push('Bronze');
    }

    volunteerRef.update({ badges });
  });
}

const userRef = firebase.database().ref("users/" + user.uid);
userRef.once("value", (snapshot) => {
  const userData = snapshot.val();
  document.getElementById("user-badges").textContent = userData.badges.join(", ") || "No badges earned yet.";
});


