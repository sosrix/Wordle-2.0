import { io } from "socket.io-client";
export const socket = io("https://wordle2-0.herokuapp.com:3003");
export let socketID = "";
socket.on("connect", () => {
  socketID = socket.id;
});
console.log(socketID);
