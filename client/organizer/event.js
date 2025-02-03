import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useState } from "react";

export default function CreateEvent() {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    location: ""
  });

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "events"), eventData);
      alert("Event Created Successfully!");
      setEventData({ title: "", description: "", date: "", location: "" });
    } catch (error) {
      console.error("Error creating event: ", error);
    }
  };

  return (
    <div>
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Event Title" value={eventData.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Event Description" value={eventData.description} onChange={handleChange} required></textarea>
        <input type="date" name="date" value={eventData.date} onChange={handleChange} required />
        <input type="text" name="location" placeholder="Event Location" value={eventData.location} onChange={handleChange} required />
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}
