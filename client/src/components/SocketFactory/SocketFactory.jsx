import io from 'socket.io-client';

const SOCKET_URL = "http://localhost:8080";

class SocketFactory {
    constructor() {
        this.socket = null;
    }

    // Return existing socket or create a new singleton instance
    getSocket() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                autoConnect: true,
                reconnection: true
            });
        }
        return this.socket;
    }

    // Close connection and reset the factory instance
    terminate() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

// Export a single instance to be used across the app
const socketFactory = new SocketFactory();
export default socketFactory;