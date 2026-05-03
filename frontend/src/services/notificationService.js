
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
let SOCKET_URL = "http://localhost:3000";
try {
    SOCKET_URL = new URL(API_URL).origin;
} catch (e) {
    SOCKET_URL = API_URL.replace(/\/api\/?$/, '');
}

console.log("[DEBUG] VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("[DEBUG] Parsed SOCKET_URL =", SOCKET_URL);

class NotificationService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(userId) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        this.socket.on('connect', () => {
            console.log('[Socket] Connected to server');
            if (userId) {
                this.socket.emit('join', userId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
        });

        // Global listeners
        this.socket.on('order_status_updated', (data) => this.notify('order_status_updated', data));
        this.socket.on('new_message', (data) => this.notify('new_message', data));
        this.socket.on('admin_notification', (data) => this.notify('admin_notification', data));
    }

    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    unsubscribe(event, callback) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            this.listeners.set(event, eventListeners.filter(cb => cb !== callback));
        }
    }

    notify(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(cb => cb(data));
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const notificationService = new NotificationService();
