// src/screens/GiverMealScreen.tsx
import React, { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import locationIcon from "../assets/location.png"; // your location icon image
import ProfileIcon from "../assets/menu profile.svg";
import SettingsIcon from "../assets/menu settings.svg";
import TalkToUsIcon from "../assets/menu contact us.svg";
import MessagesIcon from "../assets/menu notifications.svg";

interface Meal {
  id: number;
  item_description: string;
  pickup_address: string;
  box_option: "need" | "noNeed";
  food_types: string;
  ingredients: string;
  special_notes: string;
  lat: number;
  lng: number;
  avatar_url: string; // URL to an image preview
  user_id: number; // owner's id
}

const GiverMealScreen: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // For drop-down menu
  const [, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const localUserId = Number(localStorage.getItem("userId"));

  // Fetch all available meals.
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/food/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeals(res.data.meals);
      } catch (err) {
        setError("Server error fetching meals.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [API_BASE_URL]);

  // Handler to cancel (delete) the giver's meal.
  const handleConfirmCancel = async () => {
    if (!selectedMeal) return;
    try {
      const token = localStorage.getItem("token");
      // Delete the meal.
      await axios.delete(`${API_BASE_URL}/food/myMeal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Delete associated conversation (if exists).
      try {
        await axios.delete(
          `${API_BASE_URL}/meal-conversation/${selectedMeal.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          console.log("No conversation to delete.");
        } else {
          console.error("Error deleting conversation:", err);
        }
      }
      setConfirmModalOpen(false);
      setSelectedMeal(null);
      navigate("/menu");
    } catch (err) {
      console.error("Error cancelling meal:", err);
      setError("Server error cancelling meal.");
    }
  };

  // Handler: Closes the confirmation modal (leaves the meal).
  const handleLeaveIt = () => {
    setConfirmModalOpen(false);
  };

  // Toggle the drop-down menu.
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Navigation handlers for the drop-down menu.
  const goToProfile = () => {
    navigate("/profile");
  };
  const goToSettings = () => {
    navigate("/settings");
  };
  const goToTalkToUs = () => {
    navigate("/talk-to-us");
  };
  const goToMessages = () => {
    navigate("/messages", { state: { role: "giver" } });
  };

  if (loading) {
    return <div className="screen-container">Loading meals...</div>;
  }

  return (
    <div className="screen-container" style={{ position: "relative" }}>
      {/* Fixed Drop-Down Menu Icon */}
      <div
        style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 1100 }}
      >
        <div onClick={toggleMenu} style={{ cursor: "pointer" }}>
          {/* Hamburger icon (always visible) */}
          <div
            style={{
              width: "25px",
              height: "3px",
              backgroundColor: "black",
              margin: "4px 0",
            }}
          ></div>
          <div
            style={{
              width: "25px",
              height: "3px",
              backgroundColor: "black",
              margin: "4px 0",
            }}
          ></div>
          <div
            style={{
              width: "25px",
              height: "3px",
              backgroundColor: "black",
              margin: "4px 0",
            }}
          ></div>
        </div>
      </div>

      {/* Drop-Down Menu Overlay */}
      {menuOpen && (
        <div className="menu-overlay">
          {/* The hamburger icon remains in the top-right for closing */}
          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              cursor: "pointer",
            }}
            onClick={toggleMenu}
          >
            <div
              style={{
                width: "25px",
                height: "3px",
                backgroundColor: "black",
                margin: "4px 0",
              }}
            ></div>
            <div
              style={{
                width: "25px",
                height: "3px",
                backgroundColor: "black",
                margin: "4px 0",
              }}
            ></div>
            <div
              style={{
                width: "25px",
                height: "3px",
                backgroundColor: "black",
                margin: "4px 0",
              }}
            ></div>
          </div>
          <button
            onClick={() => {
              toggleMenu();
              goToProfile();
            }}
          >
            <img src={ProfileIcon} />
          </button>
          <button
            onClick={() => {
              toggleMenu();
              goToMessages();
            }}
          >
            <img src={MessagesIcon} />
          </button>
          <button
            onClick={() => {
              toggleMenu();
              goToSettings();
            }}
          >
            <img src={SettingsIcon} />
          </button>
          <button
            onClick={() => {
              toggleMenu();
              goToTalkToUs();
            }}
          >
            <img src={TalkToUsIcon} />
          </button>
        </div>
      )}

      {/* Meal Summary Card Overlay for the giver's own meal */}
      {selectedMeal && selectedMeal.user_id === localUserId && (
        <div
          className="mealCardGiver"
          style={{
            position: "absolute",
            top: "10%", // Adjust so it appears above the marker icon
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: "500px",
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: "1rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            zIndex: 1000,
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            {/* Image area (approximately 33% width) */}
            <div style={{ flex: "1", textAlign: "center" }}>
              {selectedMeal.avatar_url ? (
                <img
                  src={selectedMeal.avatar_url}
                  alt="Meal"
                  style={{
                    width: "100%",
                    maxWidth: "150px",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "150px",
                    backgroundColor: "#eee",
                  }}
                >
                  אין תמונה
                </div>
              )}
            </div>
            {/* Details area (approximately 67% width) */}
            <div style={{ flex: "2", paddingRight: "1rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>
                {selectedMeal.item_description}
              </h3>
              <p style={{ margin: "0 0 0.5rem 0" }}>
                {selectedMeal.pickup_address}{" "}
                <img
                  src={locationIcon}
                  alt="location icon"
                  style={{ width: "1rem", height: "1rem" }}
                />
              </p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setConfirmModalOpen(true);
                }}
                style={{ color: "red", textDecoration: "underline" }}
              >
                אני רוצה להסיר את המנה
              </a>
              {/* Removed the Messages button from the card */}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div
          className="confirmation-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1500,
          }}
        >
          <div className="modal-content" style={{ textAlign: "center" }}>
            <h3> ? בטוח שבא לך להסיר את המנה</h3>
            <p>
              אם המנה תוסר, היא לא תופיע יותר במפה. אם תרצה/י תוכל/י להעלות אותה
              שוב בהמשך.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "1rem",
              }}
            >
              <button id="takeOffBtn" onClick={handleLeaveIt}>
                התחרטתי, תשאירו
              </button>
              <button onClick={handleConfirmCancel}>הסירו את המנה</button>
            </div>
          </div>
        </div>
      )}

      {/* Map Container covers full screen */}
      <div className="map-container" style={{ height: "100vh" }}>
        <Map
          initialViewState={{
            latitude: 32.0853,
            longitude: 34.7818,
            zoom: 12,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        >
          {meals.map((meal) => (
            <Marker key={meal.id} latitude={meal.lat} longitude={meal.lng}>
              <div
                id="location-logo"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedMeal(meal)}
              >
                📍
              </div>
            </Marker>
          ))}
        </Map>
      </div>
    </div>
  );
};

export default GiverMealScreen;
