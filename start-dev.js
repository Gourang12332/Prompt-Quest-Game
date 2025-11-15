const { spawn } = require('child_process');
const path = require('path');

console.log('Starting PROMPT QUEST development servers...');

// Start backend server
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Start frontend server
const frontend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'client_new'),
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

backend.on('error', (error) => {
  console.error('Backend server error:', error);
});

frontend.on('error', (error) => {
  console.error('Frontend server error:', error);
});