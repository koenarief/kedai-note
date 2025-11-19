import React, { useRef, useEffect, useState } from "react";
import { auth, storage } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const LiveCameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    async function getCameraStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    }
    getCameraStream();

    // Stop the camera stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png"); // Get image as data URL
      setImageSrc(imageDataUrl);

      let mediaStream = videoRef.current.srcObject;

      const tracks = mediaStream.getTracks();
      tracks.forEach((track) => {
        track.stop(); // Stop each individual track
      });
      mediaStream = null;
    }
  };

  const uploadToFirebase = () => {
    const storageRef = ref(storage, `users/${user.uid}/${Date.now()}_canvas_image.jpg`); // Path in Storage
    const canvas = canvasRef.current;

    canvas.toBlob(
      (blob) => {
        uploadBytes(storageRef, blob)
          .then((snapshot) => {
            console.log("Uploaded a blob!");
            getDownloadURL(snapshot.ref).then((downloadUrl) => {
              console.log(downloadUrl);
            });
          })
          .catch((error) => {
            console.error("Error uploading image:", error);
          });
      },
      "image/jpeg",
      0.8,
    ); // Get Blob from canvas
  };

  return (
    <div>
      {imageSrc ? (
        <img src={imageSrc} alt="Captured" />
      ) : (
        <video ref={videoRef} autoPlay playsInline />
      )}
      <button onClick={capturePhoto}>Take Photo</button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button onClick={() => uploadToFirebase()}>Upload</button>
    </div>
  );
};

export default LiveCameraCapture;
