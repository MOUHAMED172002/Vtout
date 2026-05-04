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
    socket = io(SOCKET_URL, {
        withCredentials: true
    });
    
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
