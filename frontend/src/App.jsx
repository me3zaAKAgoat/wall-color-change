import { useEffect, useState } from "react";

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

const colors = [
  "#1E90FF",
  "#FF6347",
  "#32CD32",
  "#FFD700",
  "#FF69B4",
  "#8A2BE2",
  "#7FFF00",
  "#DC143C",
  "#00CED1",
  "#FF4500",
];

function App() {
  const [image, setImage] = useState(null);
  const [imageToUpload, setImageToUpload] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = window.localStorage.getItem("userId") || generateUniqueId();
    if (!window.localStorage.getItem("userId")) {
      window.localStorage.setItem("userId", userId);
    }

    const fetchImage = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/get_uploaded_image?user_id=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }

        const data = await response.json();
        setImage(data.image);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageToUpload) {
      setError("No file selected for upload.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", imageToUpload);
      formData.append("user_id", window.localStorage.getItem("userId"));

      const response = await fetch("http://localhost:5000/upload_image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setImage(data.image);
      setError(null); // Clear any previous errors
    } catch (error) {
      setError(error.message);
      console.error("Error uploading image:", error);
    }
  };

  const handleColorClick = async (color) => {
    try {
      const formData = new FormData();
      formData.append("color", color);
      formData.append("user_id", window.localStorage.getItem("userId"));
      const response = await fetch("http://localhost:5000/change_wall_color", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to set background color");
      }

      const data = await response.json();
      setImage(data.image);
      setError(null); // Clear any previous errors
    } catch (error) {
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
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleUpload} method="POST" encType="multipart/form-data">
        <input
          type="file"
          name="image"
          onChange={(e) => setImageToUpload(e.target.files[0])}
        />
        <button type="submit">Upload</button>
      </form>
      <ul className="absolute bottom-10 flex items-center justify-start gap-2 w-[50vw] overflow-auto border border-white/40 rounded-xl py-4 px-2 backdrop-blur-lg">
        {colors.map((color) => (
          <li key={color}>
            <button
              type="submit"
              style={{
                backgroundColor: color,
                width: "50px",
                height: "50px",
              }}
              onClick={() => handleColorClick(color)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
