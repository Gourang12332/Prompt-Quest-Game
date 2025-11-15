const mongoose = require('mongoose');
require('dotenv').config();

const Question = require('./models/Question');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => console.log(err));

// Sample questions data
const sampleQuestions = [
  // Level 0 Questions (7 questions, visible without restrictions)
  {
    level: 0,
    difficulty: 'Easy',
    keywords: ['Basic', 'Tech'],
    fullQuestion: 'First letter of the alphabet?',
    answer: 'A',
    points: 0,
    hint: 'It comes before B'
  },
  {
    level: 0,
    difficulty: 'Easy',
    keywords: ['Basic', 'Tech'],
    fullQuestion: 'Second letter of the alphabet?',
    answer: 'B',
    points: 0,
    hint: 'It comes after A'
  },
  {
    level: 0,
    difficulty: 'Easy',
    keywords: ['Basic', 'Tech'],
    fullQuestion: 'Third letter of the alphabet?',
    answer: 'C',
    points: 0,
    hint: 'It comes after B'
  },
  {
    level: 0,
    difficulty: 'Easy',
    keywords: ['Basic', 'Tech'],
    fullQuestion: 'Fourth letter of the alphabet?',
    answer: 'D',
    points: 0,
    hint: 'It comes after C'
  },
  {
    level: 0,
    difficulty: 'Easy',
    keywords: ['Basic', 'Tech'],
    fullQuestion: 'Fifth letter of the alphabet?',
    answer: 'E',
    points: 0,
    hint: 'It comes after D'
  },
  {
    level: 0,
    difficulty: 'Easy',
    keywords: ['Basic', 'Tech'],
    fullQuestion: 'Sixth letter of the alphabet?',
    answer: 'F',
    points: 0,
    hint: 'It comes after E'
  },
  {
    level: 0,
    difficulty: 'Easy',
    keywords: ['Basic', 'Tech'],
    fullQuestion: 'Seventh letter of the alphabet?',
    answer: 'G',
    points: 0,
    hint: 'It comes after F'
  },
  
  // Combined Level 1 Questions (12 questions from previous levels 1 and 2)
  {
    level: 1,
    difficulty: 'Easy',
    keywords: ['HTML', 'Structure'],
    fullQuestion: 'What does HTML stand for?',
    answer: 'HyperText Markup Language',
    points: 90,
    hint: 'It is a markup language used for creating web pages'
  },
  {
    level: 1,
    difficulty: 'Easy',
    keywords: ['CSS', 'Styling'],
    fullQuestion: 'What does CSS stand for?',
    answer: 'Cascading Style Sheets',
    points: 45,
    hint: 'It is used for styling web pages'
  },
  {
    level: 1,
    difficulty: 'Medium',
    keywords: ['JavaScript', 'Variables'],
    fullQuestion: 'Which keyword is used to declare a constant variable in JavaScript?',
    answer: 'const',
    points: 60,
    hint: 'Introduced in ES6, it prevents reassignment'
  },
  {
    level: 1,
    difficulty: 'Medium',
    keywords: ['React', 'Components'],
    fullQuestion: 'What hook is used to manage state in functional components?',
    answer: 'useState',
    points: 75,
    hint: 'It is a React hook that returns a stateful value and a function to update it'
  },
  {
    level: 1,
    difficulty: 'Hard',
    keywords: ['Node.js', 'Modules'],
    fullQuestion: 'Which function is used to import modules in Node.js?',
    answer: 'require',
    points: 90,
    hint: 'It is used to load modules in CommonJS'
  },
  {
    level: 1,
    difficulty: 'Hard',
    keywords: ['Database', 'MongoDB'],
    fullQuestion: 'What does MongoDB use to store data?',
    answer: 'BSON',
    points: 105,
    hint: 'It is a binary representation of JSON-like documents'
  },
  {
    level: 1,
    difficulty: 'Easy',
    keywords: ['Git', 'Version Control'],
    fullQuestion: 'What command is used to initialize a Git repository?',
    answer: 'git init',
    points: 90,
    hint: 'It creates an empty Git repository'
  },
  {
    level: 1,
    difficulty: 'Easy',
    keywords: ['HTTP', 'Methods'],
    fullQuestion: 'Which HTTP method is used to update a resource?',
    answer: 'PUT',
    points: 45,
    hint: 'It is used to update or replace a resource'
  },
  {
    level: 1,
    difficulty: 'Medium',
    keywords: ['Express', 'Middleware'],
    fullQuestion: 'Which method is used to mount middleware in Express?',
    answer: 'use',
    points: 60,
    hint: 'It mounts the specified middleware function or functions'
  },
  {
    level: 1,
    difficulty: 'Medium',
    keywords: ['API', 'REST'],
    fullQuestion: 'What does REST stand for?',
    answer: 'Representational State Transfer',
    points: 75,
    hint: 'It is an architectural style for designing networked applications'
  },
  {
    level: 1,
    difficulty: 'Hard',
    keywords: ['Security', 'Authentication'],
    fullQuestion: 'What does JWT stand for?',
    answer: 'JSON Web Token',
    points: 90,
    hint: 'It is an open standard for securely transmitting information'
  },
  {
    level: 1,
    difficulty: 'Hard',
    keywords: ['Deployment', 'Hosting'],
    fullQuestion: 'Which cloud platform is used in this project?',
    answer: 'MongoDB Atlas',
    points: 105,
    hint: 'It is a cloud database service for MongoDB'
  }
];

// Seed the database
const seedQuestions = async () => {
  try {
    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    // Insert sample questions
    await Question.insertMany(sampleQuestions);
    console.log('Sample questions seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
};

seedQuestions();