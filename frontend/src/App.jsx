import { useEffect, useState } from "react";
import "./App.css";

const apiUrl = import.meta.env.VITE_API_URL || "";

function generateUniqueId(length = 16) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);

  return Array.from(
    randomValues,
    (value) => charset[value % charset.length]
  ).join("");
}

// const colorCategories = {
//   neutrals: ["#EAEAEA", "#D3D3D3"], // Warm neutrals are tricky to translate directly, as they're usually described in terms of undertone rather than strict hex codes.
//   modern: ["#FFFFFF", "#F2F2F2"], // Snowbound and Creamy equivalents
//   classics: ["#D5CBB2", "#D2CEC6"], // Accessible Beige and City Loft equivalents
//   darkAndMoody: ["#0C0D0F", "#2F2F2F"], // Dark Night and Charcoal Blue equivalents
//   boldAndVibrant: ["#FF6347", "#FFA500"], // Red Tomato and Outgoing Orange equivalents
//   rustic: ["#C19A6B", "#8B4513"], // Colors inspired by the feel of Rustic Retreat
//   farmhouse: ["#F5F5DC", "#FAF0E6"], // Light, muted colors like Beige and Creamy
//   midCenturyModern: ["#C0C0C0", "#D2691E"], // City Loft and Red Tomato equivalents
//   bohemian: ["#FF4500", "#D2B48C"], // Red Tomato and earthy tones
//   coastal: ["#F5F5F5", "#4682B4"], // Light colors and ocean-inspired hues
//   scandinavian: ["#FFFFFF", "#F0F0F0"], // Clean, white shades
// };

const colors = [
  "#EAEAEA",
  "#D2CEC6",
  "#0C0D0F",
  "#2F2F2F",
  "#FF6347",
  "#C19A6B",
  "#8B4513",
  "#F5F5DC",
  "#D5CBB2",
  "#FAF0E6",
  "#C0C0C0",
  "#F2F2F2",
  "#D2691E",
  "#D3D3D3",
  "#FF4500",
  "#F5F5F5",
  "#D2B48C",
  "#4682B4",
  "#FFA500",
  "#FFFFFF",
  "#F0F0F0",
];

function App() {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = window.localStorage.getItem("userId") || generateUniqueId();
    if (!window.localStorage.getItem("userId")) {
      window.localStorage.setItem("userId", userId);
    }

    const fetchImage = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiUrl}/get_uploaded_image?user_id=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setLoading(false);

        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }

        if (response.status === 204) {
          return;
        }
        const data = await response.json();
        setImage(data.image);
      } catch (error) {
        setLoading(false);
        setError(error.message);
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, []);

  const handleUpload = async (imageToUpload) => {
    if (!imageToUpload) {
      setError("No file selected for upload.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", imageToUpload);
      formData.append("user_id", window.localStorage.getItem("userId"));

      setLoading(true);
      const response = await fetch(`${apiUrl}/upload_image`, {
        method: "POST",
        body: formData,
      });

      setLoading(false);
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setImage(data.image);
      setError(null); // Clear any previous errors
    } catch (error) {
      setLoading(false);
      setError(error.message);
      console.error("Error uploading image:", error);
    }
  };

  const handleColorClick = async (color) => {
    try {
      const formData = new FormData();
      formData.append("color", color);
      formData.append("user_id", window.localStorage.getItem("userId"));

      setLoading(true);
      const response = await fetch(`${apiUrl}/change_wall_color`, {
        method: "POST",
        body: formData,
      });
      setLoading(false);

      if (!response.ok) {
        throw new Error("Failed to set background color");
      }

      const data = await response.json();
      setImage(data.image);
      setError(null); // Clear any previous errors
    } catch (error) {
      setLoading(false);
      setError(error.message);
      console.error("Error setting background color:", error);
    }
  };
  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <label
        htmlFor="file-input"
        className={`vite-button rounded-lg cursor-pointer absolute transition-all backdrop-blur border border-white/20 capitalize text-center ${
          image
            ? "top-11 left-7 px-3 pb-2 pt-1"
            : "top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 p-3"
        }`}
      >
        {image ? (
          <img
            src="/refresh.png"
            alt="refresh"
            className="w-5 h-5 inline-block"
          />
        ) : (
          "upload an image and paint your home"
        )}
      </label>

      <input
        id="file-input"
        type="file"
        name="image"
        onChange={(e) => handleUpload(e.target.files[0])}
      />
      <img
        src="/that1painter.png"
        alt="logo"
        className="h-12 rounded-full bg-white p-4 py-1 top-10 left-[50%] transform -translate-x-1/2 absolute"
      />
      <button className="vite-button px-3 pb-2 pt-1 rounded-lg cursor-pointer absolute top-11 right-7 transition-all backdrop-blur border border-white/20">
        <img src="/share.png" alt="share" className="w-5 h-5 inline-block" />
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {loading && (
        <div className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
      <div className="absolute bottom-28 w-[60vw] overflow-auto border border-white/80 rounded-3xl px-6 py-4 backdrop-blur-xl">
        <ul className="flex items-center justify-start gap-2 overflow-auto">
          {colors.map((color) => (
            <li key={color}>
              <button
                type="submit"
                className="rounded-xl"
                style={{
                  backgroundColor: color,
                  width: "40px",
                  height: "40px",
                }}
                onClick={() => handleColorClick(color)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
