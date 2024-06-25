import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";

import "../App.css";

const Webcam = () => {
  const videoRef = useRef(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);

  const runCoco = async () => {
    const net = await cocossd.load();
    console.log("Coco model loaded.");
    setInterval(() => {
      detect(net);
    }, 8000);
  };

  const detect = async (net) => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      const video = videoRef.current;

      const obj = await net.detect(video);
      console.log(obj);

      // Aktualizacja stanu z wykrytymi obiektami
      setDetectedObjects(
        obj.map((detection) => ({
          x: detection.bbox[0],
          y: detection.bbox[1],
          width: detection.bbox[2],
          height: detection.bbox[3],
          class: detection.class,
          score: detection.score, 
        }))
      );

      requestAnimationFrame(() => detect(net));
    }
  };

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    if (isWebcamOn) {
      startWebcam();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isWebcamOn]);

  const toggleWebcam = () => {
    setIsWebcamOn(!isWebcamOn);
  };

  useEffect(() => {
    runCoco();
  }, []);

  return (
    <>
      <div>
        <video ref={videoRef} autoPlay playsInline muted className="camView" />
        <div style={{ position: "relative" }}>
          {detectedObjects.filter(obj => obj.score > 0.66).map((obj, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                border: "2px solid red",
                left: `${obj.x}px`, // Zmiana na obj.x
                top: `${obj.y}px`, // Zmiana na obj.y
                width: `${obj.width}px`, // Zmiana na obj.width
                height: `${obj.height}px`, // Zmiana na obj.height
                color: "red",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              {obj.class}
              {obj.score && <span> ({Math.round(obj.score * 100)}%)</span>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <button onClick={toggleWebcam}>
          {isWebcamOn ? "Turn Off Camera" : "Turn On Camera"}
        </button>
      </div>
    </>
  );
};

export default Webcam;
