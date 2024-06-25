import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";

import { drawRect } from "../utilities/Draw";

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
    }, 10000);
  };

  const detect = async (net) => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      const video = videoRef.current;

      const obj = await net.detect(video);
      console.log(obj);

      // Aktualizacja stanu z wykrytymi obiektami
      setDetectedObjects(
        obj.map((detection) => ({
          ...detection.bbox,
          class: detection.class,
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
          {detectedObjects.map((obj, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                border: "2px solid red",
                left: `${obj[0]}px`,
                top: `${obj[1]}px`,
                width: `${obj[2]}px`,
                height: `${obj[3]}px`,
                color: "red",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              {obj.class}
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
