// Firebase Firestore Setup
import { db } from "./firebaseConfig";
import { collection, doc, updateDoc, getDoc, query, where, getDocs } from "firebase/firestore";

// Assign Points to Volunteers (Organizer Function)
async function assignPoints(volunteerId, eventId, points) {
    const userRef = doc(db, "users", volunteerId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    let newPoints = (userSnap.data().points || 0) + points;
    let badge = "";
    if (newPoints >= 50 && newPoints < 101) badge = "Bronze";
    else if (newPoints >= 101 && newPoints < 201) badge = "Silver";
    else if (newPoints >= 201 && newPoints <= 500) badge = "Gold";

    await updateDoc(userRef, { points: newPoints, badge });
    console.log(`Assigned ${points} points to ${volunteerId}, New Badge: ${badge}`);
}

// Fetch Volunteer Leaderboard
async function getLeaderboard(level, region) {
    const usersRef = collection(db, "users");
    let q;
    if (level === "state") q = query(usersRef, where("state", "==", region));
    else if (level === "district") q = query(usersRef, where("district", "==", region));

    const snapshot = await getDocs(q);
    let leaderboard = [];
    snapshot.forEach(doc => {
        leaderboard.push({ id: doc.id, ...doc.data() });
    });

    leaderboard.sort((a, b) => b.points - a.points);
    return leaderboard;
}

// Fetch Volunteer Profile
async function getVolunteerProfile(volunteerId) {
    const userRef = doc(db, "users", volunteerId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    return userSnap.data();
}

export { assignPoints, getLeaderboard, getVolunteerProfile };
