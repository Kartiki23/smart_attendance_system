import Timetable from "../models/Timetable.js";

export const findCurrentLecture = async (facultyId) => {

  const days = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  ];

  const now = new Date();

  const today = days[now.getDay()];

  const currentTime = now.toTimeString().slice(0,5); // HH:MM

  const lectures = await Timetable.find({
    facultyId,
    day: today
  });

  let currentLecture = null;

  lectures.forEach(lecture => {

    if(currentTime >= lecture.startTime && currentTime <= lecture.endTime){

      currentLecture = lecture;

    }

  });

  return currentLecture;

};