import clock from "clock"; //needed to have a clock! (see line 33)
import document from "document"; // needed for I have no idea what! If you don't put this nothing works!!!
import { preferences } from "user-settings"; // needed to get the user preference 12h or 24h (see line 38)
import { zeroPad, nameOfMonth } from "../common/utils"; // import user function zeroPad (see lines 43, 45, 46)
import { battery } from "power"; // import battery level (see line26)
//import { userActivity } from "user-activity"; //adjusted types (matching the stats that you upload to fitbit.com, as opposed to local types)
import { me as appbit } from "appbit";
import { today } from "user-activity";

import * as messaging from "messaging";

import { Accelerometer } from "accelerometer";
import { display } from "display";
import { Gyroscope } from "gyroscope";
import { HeartRateSensor } from "heart-rate";
import { OrientationSensor } from "orientation";

import { inbox } from "file-transfer";
import { outbox } from "file-transfer";
import * as fs from "fs";
import { encode } from 'cbor';
import { listDirSync } from "fs";

// Update the clock every minute
clock.granularity = "seconds"; //clock is refreshing every sec. It is possible to select minutes as well

// Get a handle on the <text> elements specified in the index.gui file
const timeHandle = document.getElementById("timeLabel"); 
const batteryHandle = document.getElementById("batteryLabel");
const stepsHandle = document.getElementById("stepsLabel");
const heartrateHandle = document.getElementById("heartrateLabel");
const dateHandle = document.getElementById("dateLabel")
const myButton = document.getElementById("button-1");
let gatheringData = false
myButton.text = "GATHER DATA";
//let file;
let filename;

let dirIter
  const listDir = listDirSync("/private/data");
  while((dirIter = listDir.next()) && !dirIter.done) {
    console.log(dirIter.value);
    fs.unlinkSync(dirIter.value);
    console.log('file deleted')
  }


const mainAccelJson = []
const mainGyroJson = []
const mainOrientationJson = []

myButton.addEventListener("click", (evt) => {
  //const myButton = document.getElementById("button-1");
  console.log("CLICKED");
  if (gatheringData) {
    myButton.text = "GATHER DATA";
    gatheringData = false
    sendMessage(mainAccelJson);
    sendMessage(mainGyroJson);
    sendMessage(mainOrientationJson);
    mainAccelJson = []
    mainGyroJson = []
    mainOrientationJson = []
    sendMessage("Stop")
  }
  else {
    sendMessage("Start");
    myButton.text = "STOP";
    gatheringData = true
       
  }
  
})

// The following block read the heart rate from your watch
const hrm = new HeartRateSensor();

let date = new Date();
let month = nameOfMonth(date.getMonth());
let day = date.getDate();
const dateText = month + ", "  + day ;
dateHandle.text = dateText;

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  const now = evt.date; // get the actual instant
  let hours = now.getHours(); // separate the actual hours from the instant "now"
  let mins = now.getMinutes(); // separate the actual minute from the instant "now"
  let secs = now.getSeconds(); // separate the actual second from the instant "now"
  if (preferences.clockDisplay === "24h") { // check from your wach settings if you use 12h or 24h visualization
    // 24h format
    hours = zeroPad(hours); // when you use 24h in case hours are in one digit then I put a zero in front. i.e. 3 am -> 03
  } else {
    // 12h format
    hours = hours % 12 || 12; 
  }
  let minsZeroed = zeroPad(mins); // one digit mins get a zero in front
  let secsZeroes = zeroPad(secs); // one digit secs get a zero in front
  timeHandle.text = `${hours}:${minsZeroed}:${secsZeroes}`; // time in format hh:mm:ss is assigned in the timeHandle defined at line 13
  let month = nameOfMonth(date.getMonth());
  let day = now.getDate();
  const dateText = month + ", "  + day ;
  dateHandle.text = dateText;
  
  
  // Activity Values: adjusted type
  let stepsValue = (today.adjusted.steps || 0); // steps value measured from fitbit is assigned to the variable stepsValue
  stepsHandle.text = stepsValue; // the string stepsString is being sent to the stepsHandle set at line 15
  
   // Battery Measurement
  let batteryValue = battery.chargeLevel; // measure the battery level and send it to the variable batteryValue
  
  // Assignment value battery
  batteryHandle.text = `${batteryValue}%`; // the string including the batteryValue is being sent to the batteryHandle set at line 14
}

function gatherData(jsonObj, timestamp, value) {  
    jsonObj[timestamp] = value ;
  
  return jsonObj;
}

let heartRateJson = {}

if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1});
  hrm.addEventListener("reading", () => {
    var hrmJson = JSON.stringify({
      heartRate: hrm.heartRate ? hrm.heartRate : 0
    });
    heartrateHandle.text = `${hrm.heartRate}`;
    
  });
  sensors.push(hrm);
  hrm.start();
  
}
const sensors = [];


if (Accelerometer) {
  
    const accel = new Accelerometer({ frequency: 50});
    
    accel.addEventListener("reading", () => {

      var accelJson = JSON.stringify({
        x: accel.x ? accel.x.toFixed(1) : 0,
        y: accel.y ? accel.y.toFixed(1) : 0,
        z: accel.z ? accel.z.toFixed(1) : 0

      });
      if (gatheringData){
        var accelToSend = { "a": [], "t": [] }
        accelToSend.a.push(accelJson);
        
        let currentTime = new Date().getTime()
        accelToSend.t.push(currentTime)
        
        mainAccelJson.push(accelToSend)
  
        if (mainAccelJson.length >= 19) {
          console.log('Sending for Accel')
          sendMessage(mainAccelJson);
          mainAccelJson = []
        }
      }

    });
    sensors.push(accel);
    accel.start();
  
}

if (Gyroscope) {
  
    const gyro = new Gyroscope({ frequency: 50});
    gyro.addEventListener("reading", () => {
      var gyroJson = JSON.stringify({
        x: gyro.x ? gyro.x.toFixed(1) : 0,
        y: gyro.y ? gyro.y.toFixed(1) : 0,
        z: gyro.z ? gyro.z.toFixed(1) : 0,
      });
      if (gatheringData){
        var gyroToSend = { "g": [], "t": [] }
        gyroToSend.g.push(gyroJson);
        
        let currentTime = new Date().getTime()
        gyroToSend.t.push(currentTime)
        
        mainGyroJson.push(gyroToSend)
        //console.log(mainGyroJson.length)
  
        if (mainGyroJson.length >= 19) {
          console.log('Sending for Gyro')
          sendMessage(mainGyroJson);
          mainGyroJson = []
        }
        
      }
    });
    sensors.push(gyro);
    gyro.start();
}



if (OrientationSensor) {
  
    const orientation = new OrientationSensor({ frequency: 50});
    orientation.addEventListener("reading", () => {
      var orientationJson = JSON.stringify({
          s: orientation.quaternion[0] ? orientation.quaternion[0].toFixed(1) : 0,
          i: orientation.quaternion[1] ? orientation.quaternion[1].toFixed(1) : 0,
          j: orientation.quaternion[2] ? orientation.quaternion[2].toFixed(1) : 0,
          k: orientation.quaternion[3] ? orientation.quaternion[3].toFixed(1) : 0,        
      });
      
      //console.log(orientationJson)
      
      if (gatheringData){
        var orientationToSend = { "o": [], "t": [] }
        orientationToSend.o.push(orientationJson);

        let currentTime = new Date().getTime()
        orientationToSend.t.push(currentTime)
                
        mainOrientationJson.push(orientationToSend)
  
        if (mainOrientationJson.length >= 16) {
          console.log('Sending for Orientation')
          sendMessage(mainOrientationJson);
          mainOrientationJson = []
        }
      }
    });
    sensors.push(orientation);
    orientation.start();
}


messaging.peerSocket.addEventListener("open", (evt) => {
  //sendMessage();
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error('Connection error: ${err.code} - ${err.message}');
});

function sendMessage(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    //console.log(data);
    messaging.peerSocket.send(data);
  }
}








