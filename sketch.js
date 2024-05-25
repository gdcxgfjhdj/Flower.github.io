//I use chatGPT to assist in creating and building this p5 sketch. I have made improvements and adjustments to the code as necessary
// The source of the video is provided at this link: https://pan.baidu.com/s/1T5UcHeNMreZ7UvqXZXw_iw?pwd=1111
// While searching for and using light detection code, I referred to the following resources:https://p5js.org/examples/dom-video-capture.html    https://p5js.org/examples/color-brightness.html   https://www.geeksforgeeks.org/p5-js-lights-camera-complete-reference/
let myVideo;
let capture;
const maxLight = 255;
const minLight = 0;
let lastAvgLight = 0;
const lightThreshold = 10;
const changeRate = 0.3; // Increase the rate of change
let targetTime = 0;
let smoothing = true;
const alpha = 0.1;
let lastUpdateTime = 0;
const minUpdateInterval = 100; // Shorten the update interval

p5.disableFriendlyErrors = true;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  console.log("Setup initiated");

  myVideo = createVideo('1.mp4', videoLoaded);
  myVideo.hide();

  capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();

  setInterval(updateTargetTime, 50); // Update the target time more frequently

  frameRate(60); // Set to a frame rate supported by most devices
  console.log("Setup complete");
}

function videoLoaded() {
  console.log("Video loaded");
  myVideo.volume(0);
  myVideo.onended(() => myVideo.time(0));
  myVideo.play();
  myVideo.pause();
  myVideo.time(0);
  myVideo.play();
  myVideo.pause();
}

function draw() {
  background(0);
  if (myVideo) {
    image(myVideo, -width / 2, -height / 2, width, height);
    let currentTime = myVideo.time();
    let timeDiff = targetTime - currentTime;

    if (smoothing && millis() - lastUpdateTime > minUpdateInterval) {
      let newTime = currentTime + timeDiff * changeRate;
      myVideo.time(newTime);
      lastUpdateTime = millis();
    } else if (!smoothing) {
      myVideo.time(targetTime);
    }
  } else {
    console.log("Video not loaded yet");
  }
}

function updateTargetTime() {
  let avgLight = getAverageLight();
  let lightDifference = abs(avgLight - lastAvgLight);

  if (lightDifference > lightThreshold) {
    avgLight = alpha * avgLight + (1 - alpha) * lastAvgLight;
    let videoDuration = myVideo.duration();
    targetTime = map(avgLight, minLight, maxLight, 0, videoDuration, true);
    console.log("Target time updated to:", targetTime);
    lastAvgLight = avgLight;
  }
}

function getAverageLight() {
  capture.loadPixels();
  let totalLight = 0;
  let pixelCount = 0;

  for (let y = 0; y < capture.height; y += 16) {
    for (let x = 0; x < capture.width; x += 16) {
      let index = (y * capture.width + x) * 4;
      let r = capture.pixels[index];
      let g = capture.pixels[index + 1];
      let b = capture.pixels[index + 2];
      let pixelLight = (r + g + b) / 3;
      totalLight += pixelLight;
      pixelCount++;
    }
  }

  return totalLight / pixelCount;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}