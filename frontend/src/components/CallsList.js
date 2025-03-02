import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const CallsList = () => {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/calls`)
      .then((response) => response.json())
      .then((data) => setCalls(data))
      .catch((error) => console.error("Error fetching calls:", error));
  }, []);

  return (
    <div>
      <h2>Call Records</h2>
      {calls.length > 0 ? (
        <ul>
          {calls.map((call) => (
            <li key={call._id}>
              <strong>Agent:</strong> {call.agentId} <br />
              <strong>Audio:</strong> <a href={call.audioFile}>Listen</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No calls found.</p>
      )}
    </div>
  );
};

export default CallsList;
