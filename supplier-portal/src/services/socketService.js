import { io } from "socket.io-client";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
let SOCKET_URL = "http://localhost:3000";
try {
    SOCKET_URL = new URL(API_URL).origin;
} catch (e) {
    SOCKET_URL = API_URL.replace(/\/api\/?$/, '');
}

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
