import { io } from "socket.io-client";

const socket = io("https://smartattendancesystem-2-esaj.onrender.com", {
    transports:["websocket"],
  withCredentials: true
});

export default socket;