import { io } from "socket.io-client";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SOCKET_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;

let socket;

export const initSocket = (userId) => {
    if (socket) return socket;
    socket = io(SOCKET_URL);
    
    if (userId) {
        socket.emit('join', userId);
    }
    
    return socket;
};

export const getSocket = () => socket;

export const sendMessage = (message) => {
    if (socket) {
        socket.emit('send_message', message);
    }
};
