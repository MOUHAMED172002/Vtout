import { io } from "socket.io-client";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SOCKET_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;

let socket;

export const initSocket = (userId) => {
    socket = io(SOCKET_URL);
    
    if (userId) {
        socket.emit('join', userId);
    }
    
    return socket;
};

export const getSocket = () => socket;

export const joinAdminRoom = () => {
    if (socket) {
        socket.emit('join', 'admins');
    }
};

export const sendLocation = (data) => {
    if (socket) {
        socket.emit('driver_location', data);
    }
};

export const sendMessage = (message) => {
    if (socket) {
        socket.emit('send_message', message);
    }
};
