import { io } from "socket.io-client";

export const socket = io("http://localhost:3003");
export let socketID = "";
socket.on("connect", () => {
  socketID = socket.id;
});
console.log(socketID);
socket.disconnect();
