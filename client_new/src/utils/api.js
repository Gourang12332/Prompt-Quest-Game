import axios from 'axios';

const API_BASE_URL = "https://prompt-quest-game.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Team APIs
export const createTeam = (teamName, members = []) => api.post('/teams', { teamName, members });
export const getTeam = (id) => api.get(`/teams/${id}`);
export const updateTeamPoints = (teamId, points) => api.put('/teams/points', { teamId, points });
export const updateTeamLevel = (teamId, level) => api.put('/teams/level', { teamId, level });
export const updateSolvedQuestions = (teamId) => api.put('/teams/solved-questions', { teamId });
export const getScoreboard = () => api.get('/teams');

// Question APIs
export const getQuestionsByLevel = (level) => api.get(`/questions/${level}`);
export const getAllQuestions = () => api.get('/questions');

// Attempt APIs
export const getOrCreateAttempt = (teamId, questionId) => api.post('/attempts/get-or-create', { teamId, questionId });
export const submitAnswer = (attemptId, answer, correctAnswer, points, teamId) => api.post('/attempts/submit', { attemptId, answer, correctAnswer, points, teamId });
export const buyAttempts = (teamId, attemptId, pointsToDeduct) => api.post('/attempts/buy-attempts', { teamId, attemptId, pointsToDeduct });
export const getHint = (attemptId, useFreeHint = false) => api.post('/attempts/hint', { attemptId, useFreeHint });

// PowerUp APIs
export const buyPowerUp = (teamId, type, pointsToDeduct) => api.post('/powerups/buy', { teamId, type, pointsToDeduct });
export const usePowerUp = (powerUpId) => api.put('/powerups/use', { powerUpId });

export default api;