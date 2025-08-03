import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: true,
    reconnectionAttempts: 3,
    timeout: 5000,
});

export default socket;
