import { io } from "socket.io-client";
import { useEffect } from "react";
export const socket = io("http://localhost:3003");
export let socketID = "";
socket.on("connect", () => {
  socketID = socket.id;
});
console.log(socketID);
