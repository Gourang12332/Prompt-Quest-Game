import { io } from 'socket.io-client';

// Get socket URL from environment variable or use API URL
const getSocketURL = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  // Remove /api from the end if present, and use the base URL for socket
  return apiUrl.replace('/api', '');
};

const SOCKET_URL = getSocketURL();

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL);
  }
  return socket;
};

export const joinScoreboard = () => {
  if (socket) {
    socket.emit('join-scoreboard');
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export default socket;