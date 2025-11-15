import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateTeamPoints, updateSolvedQuestions } from '../utils/api';

// 50 Questions Bank (Frontend Only)
// Images can be added as: image: '/path/to/image.jpg' or image: 'https://example.com/image.jpg'
const QUESTION_BANK = [
  // Easy Questions (Cost: 50 points each, 2 attempts)
  {
      "id": 1,
      "category": "Easy",
      "cost": 50,
      "question": "I am small and quiet, but hold immense power, I end every thought, every variable hour. Forget me at the end of a line, just one time, And your compiler will scream that you've committed a crime. What punctuation mark am I?",
      "answer": ";",
      "attempts": 2,
      "image": null
  },
  {
      "id": 2,
      "category": "Easy",
      "cost": 50,
      "question": "I sit at the very top, bold and wide, I help you learn, explore, and decide. Ignore the row that comes below, It’s just quick links - not part of the show. So count me right, don’t be misled, How many tabs are on the topmost thread?",
      "answer": "4",
      "attempts": 2,
      "image": null
  },
  {
      "id": 3,
      "category": "Easy",
      "cost": 50,
      "question": "\"I'm the first to greet, when programs meet,\nA space in the code, but not for your feet.\nBefore B, after @, in the ASCII flow,\nTell me my number, and let your knowledge show!\"",
      "answer": "65",
      "attempts": 2,
      "image": null

  },
  {
      "id": 4,
      "category": "Easy",
      "cost": 50,
      "question": "\"Two twins, i++ and ++i, started a race in the world of C.\nBoth were born with the same initial value, but one grew up before being printed, while the other after.\nIn the end, they seemed to reach similar results — yet their outputs never truly matched.\n\nWho is the elder twin?  \"",
      "answer": "++i",
      "attempts": 2,
      "image": null
  },
  {
      "id": 5,
      "category": "Easy",
      "cost": 50,
      "question": "100\nFind the missing number.",
      "answer": "100",
      "attempts": 2,
      "image": "/images/question5.jpg"
  },
  {
      "id": 6,
      "category": "Easy",
      "cost": 50,
      "question": "Bridge Crossing with Limited Time Four people must cross a bridge at night:\nPerson A: 1 min \nPerson B: 2 min \nPerson C: 5 min \nPerson D: 8 min \nOnly two people can cross at a time, and they have only one torch. Find minimum total crossing time.",
      "answer": "15",
      "attempts": 2,
      "image": null
  },
  {
      "id": 7,
      "category": "Easy",
      "cost": 50,
      "question": "Today’s date hides a secret in binary land.\nTake only the day from it, flip its bits, add one —\nand the truth will reveal itself.\nWhat’s the final 8-bit form?",
      "answer": "11110001",
      "attempts": 2,
      "image": null
  },
  {
      "id": 8,
      "category": "Easy",
      "cost": 50,
      "question": "Consider this position:\n * It is White's turn to move.\n * The Black King is on h8, trapped in the corner.\n * A Black pawn is on g7, blocking its king's escape to g7.\n * The White Rook is on d4.\n * The White King is on g6 (supporting the rook).\nThe Question:\nA single final move can make the game end and white as winner. If the Rook makes the white win , What is the final position of the rook on chessboard ?",
      "answer": "d8",
      "attempts": 2,
      "image": null
  },
  {
      "id": 9,
      "category": "Easy",
      "cost": 50,
      "question": "11 : 25 :: 15 : 49 :: 19 : 81 find for 25: ? .",
      "answer": "144",
      "attempts": 2,
      "image": null
  },
  {
      "id": 10,
      "category": "Easy",
      "cost": 50,
      "question": "I lie where Bavarian hills surround,\nA yearly festival of hops and sound.\nMy team in red has won much acclaim,\nAnd monks once gave my city its name.\nI rhyme with something “tunic” might say,\nCan you guess me without delay?",
      "answer": "munich",
      "attempts": 2,
      "image": null
  },
  {
      "id": 11,
      "category": "Easy",
      "cost": 50,
      "question": "Riya was chatting with her friends about her age in a playful mood. She said,The day before yesterday, I was 18 years old. But by the end of next year, I’ll be 21!\"Her friends were puzzled and started guessing.Can you figure out date on which Riya celebrates her birthday if current year is 2025, given her mysterious statement about her age? (format dd/mm)",
      "answer": "30/12",
      "attempts": 2,
      "image": null
  },
  {
      "id": 12,
      "category": "Easy",
      "cost": 50,
      "question": "Find the number of differences",
      "answer": "3",
      "attempts": 2,
      "image": "/images/question12.jpg"
  },
  {
      "id": 13,
      "category": "Easy",
      "cost": 50,
      "question": "If a loop runs from i = 1 to i = 20 and inside it ,this happens: if (i % 4 == 0) i = i + 2; How many iterations actually execute?",
      "answer": "12",
      "attempts": 2,
      "image": null
  },
  {
      "id": 14,
      "category": "Easy",
      "cost": 50,
      "question": "If RAJASTHAN  = 9R17J8L19H13 in a coded language , then what is the encrypted form of the MANIPUR ?",
      "answer": "14m13v11j9",
      "attempts": 2,
      "image": null
  },
  {
      "id": 15,
      "category": "Easy",
      "cost": 50,
      "question": "The following diagram shows the number of people who uses Twitter, LinkedIn, WhatsApp and Instagram. If the total number of people is 600, then what is the number of people who are using Twitter and Linkedin but not WhatsApp ?",
      "answer": "10",
      "attempts": 2,
      "image": "/images/question15.jpg"
  },
  // Medium Questions (Cost: 100 points each, 3 attempts)
  {
      "id": 16,
      "category": "Medium",
      "cost": 100,
      "question": "The new data protocol requires a precise flow: first, pool the primary and secondary inputs. This combined figure must then be scaled by the growth factor. Once scaled, the value is portioned by the number of units. Only as the final step may you reconcile the final cost.\n\nSolve 10+5×6÷3-4",
      "answer": "26",
      "attempts": 3,
      "image": null
  },
  {
      "id": 17,
      "category": "Medium",
      "cost": 100,
      "question": "Find the next number -\n13,34,84,163,281, ?",
      "answer": "458",
      "attempts": 3,
      "image": null
      },
  {
      "id": 18,
      "category": "Medium",
      "cost": 100,
      "question": "Alan has three children — Brian, Carl, and Denise.\nBrian is married to Diana, who already had a daughter, Ella, from her previous marriage. Later, Brian and Diana had a son, Frank.Carl married Fiona, and they have a daughter, Hannah. After a few years, Ella got married and adopted a little girl, Rose. Denise choosed to stay with Alan and named all her property on the children Frank , Hannah  who she calls her son and daughter.                                                                                                                                                 How many grandchildren does Alan have ?                           ",
      "answer": "3",
      "attempts": 3,
      "image": null
  },
  {
      "id": 19,
      "category": "Medium",
      "cost": 100,
      "question": "How many times in a day, are the hands of a clock in straight line but opposite in direction?",
      "answer": "22",
      "attempts": 3,
      "image": null
  },
  {
      "id": 20,
      "category": "Medium",
      "cost": 100,
      "question": "Somewhere in the records of the 2025 batch hides the very first ECE student.\nTheir ID holds two secret numbers guarding a code in between.\nTurn those numbers into the language of ancient Rome,\nkeep the middle code untouched,\nand fuse them all together into one long spell of letters.\nWhat secret string is born?",
      "answer": "mmxxvkuecmmi",
      "attempts": 3,
      "image": null
  },
  {
      "id": 21,
      "category": "Medium",
      "cost": 100,
      "question": "Lucy rolled a dice but it got mixed with all the other die later without changing the number that was rolled. Her brother Alex remembers the color of the dice while her sister Brenda remembers the number of the dice. Assume both are great logicians.\n\"\"Lucy rolled a dice but it got mixed with all the other die later without changing the number that was rolled. Her brother Alex remembers the color of the dice while her sister Brenda remembers the number of the dice. Assume both are great logicians. \nA says to B: I know you don't know which dice it is. \nB says: Well I didn't, but I know now. \nA: Then I also know. \n\nWhich is the dice?\n(Example answer - B2 where B comes from Blue and 2 is the num\"\"                                                                                                        ",
      "answer": "b6",
      "attempts": 3,
      "image": "/images/question21.jpg"
  },
  {
      "id": 22,
      "category": "Medium",
      "cost": 100,
      "question": "In one of the earlier academic schemes of IIIT Kota, before the latest curriculum revision for the B.Tech. CSE program, there was a fixed total credit requirement for graduation. What was that official total credit count in that previous structure?",
      "answer": "175",
      "attempts": 3,
      "image": null
  },
  {
      "id": 23,
      "category": "Medium",
      "cost": 100,
      "question": "I seem like a value, yet I’m a silent thief.\nI never hold the data — I only steal where it lives.\nOne wrong move, and chaos takes over.\nWho am I?\n\nNow, find the coordinates of the 4th letter of my name in the form (a, b).    ",
      "answer": "(5,5)",
      "attempts": 3,
      "image": "/images/question23.jpg"
  },
  {
      "id": 24,
      "category": "Medium",
      "cost": 100,
      "question": "If 953 , (RVXYS) , 28\nWhat word fits in the bracket : \n714 , ( ) , 65  ",
      "answer": "tzwuv",
      "attempts": 3,
      "image": null
  },
  {
      "id": 25,
      "category": "Medium",
      "cost": 100,
      "question": "I )Identify the  date of the Problem of the Day (POTD) from GeeksforGeeks site for the month of October that received the highest number of submissions?    \nAns a        \n                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     \nII) On the 'Problem of the Day' for November 12th, how many different companies are tagged for the 'Wildcard Pattern Matching' problem?\nAns b \n\nAns : Sum of a and b",
      "answer": "13",
      "attempts": 3,
      "image": null
  },
  {
      "id": 26,
      "category": "Medium",
      "cost": 100,
      "question": "Given 5 chairs are arranged in a circle with numbered 1 to 5 and five persons A,B,C,D,E are seated in such a way so that person with tag vowel are seated on chairs, where sum of numbering on chair modulo 2 is always equal 1, Find how many different ways 5 persons are seated on chairs?",
      "answer": "36",
      "attempts": 3,
      "image": null
  },
  {
      "id": 27,
      "category": "Medium",
      "cost": 100,
      "question": "I roll two standard, six-sided dice and keep the result hidden from you.I then look at the dice and give you a single, truthful clue:\n\"I can see at least one 6.\"\nGiven this new information, what is the probability that the sum of the two dice is exactly 9?",
      "answer": "2/11",
      "attempts": 3,
      "image": null
  },
  {
      "id": 28,
      "category": "Medium",
      "cost": 100,
      "question": "Count number of triangles",
      "answer": "20",
      "attempts": 3,
      "image": "/images/question28.jpg"
  },
  {
      "id": 29,
      "category": "Medium",
      "cost": 100,
      "question": "Find odd one out",
      "answer": "a",
      "attempts": 3,
      "image": "/images/question29.jpg"
  },
  {
      "id": 30,
      "category": "Medium",
      "cost": 100,
      "question": "A shopkeeper buys 200 chocolates at ₹20 each. He sells 80 chocolates at 25% profit, 50 at 10% loss, and the rest at 5% profit. If he wants to achieve an overall profit of 15%, at what price should he sell the remaining chocolates? Also, find the actual overall profit/loss if he sells the remaining chocolates at ₹21 each.",
      "answer": "4370",
      "attempts": 3,
      "image": null
  },
  {
      "id": 31,
      "category": "Medium",
      "cost": 100,
      "question": "Five people — P, Q, R, S, T — sit in a row facing north.\nQ is not next to S.\nP sits somewhere to the right of Q.\nR is at one of the ends.\nT sits between P and S.\nWho sits in the middle?",
      "answer": "p",
      "attempts": 3,
      "image": null
  },
  {
      "id": 32,
      "category": "Medium",
      "cost": 100,
      "question": "A certain Code is a 4 digit number ABCD (each letter a single digit)\n1) A=B+C-2\n2) D=A-2\n3) B is Prime.\n4) C is an even, non-zero digit.\n5) The digits add up to 18.\nFind the Code.",
      "answer": "6264",
      "attempts": 3,
      "image": null
  },
  {
      "id": 33,
      "category": "Medium",
      "cost": 100,
      "question": "If\nCOMPUTER = 12\nKEYBOARD = 10\nMONITOR = 7\n\nWhat is the value of HEADPHONE?",
      "answer": "36",
      "attempts": 3,
      "image": null
  },
  {
      "id": 34,
      "category": "Hard",
      "cost": 200,
      "question": "A data packet travels through 5 routers.\nEach router increases latency by 12 ms, except one faulty router which doubles the latency value at that point.\nTotal latency observed = 108 ms.\nAt which router number is the faulty one?",
      "answer": "4",
      "attempts": 4,
      "image": null
  },
  {
      "id": 35,
      "category": "Hard",
      "cost": 200,
      "question": "In a custom cipher,\nA → D\nB → F\nC → H\nD → J (pattern continues…)\nWhat is the encrypted form of SYSTEM?",
      "answer": "nznplb",
      "attempts": 4,
      "image": null
  },
  {
      "id": 36,
      "category": "Hard",
      "cost": 200,
      "question": "Three couples (A1, A2, B1, B2, C1, C2) are to be seated around a circular table with 6 chairs. Members of the same couple must not sit next to each other. How many such seating arrangements are possible?",
      "answer": "96",
      "attempts": 4,
      "image": null
  },
  {
      "id": 37,
      "category": "Hard",
      "cost": 200,
      "question": "Three prisoners are standing in a line, all facing the same direction.\n\nPrisoner 1 sees the hats on Prisoners 2 and 3.\nPrisoner 2 sees the hat on Prisoner 3.\nPrisoner 3 sees no one.\n\nThey know that there are 3 red hats and 2 blue hats in total.\nA guard places one hat on each of their heads.\n\nThe guard asks them one by one:\nPrisoner 1 says: I don't know my hat color.\nPrisoner 2 says: I don't know my hat color.\nPrisoner 3 then says: I know my hat color!\n\nWhat color is Prisoner 3's hat?",
      "answer": "red",
      "attempts": 4,
      "image": null
  },
  {
      "id": 38,
      "category": "Hard",
      "cost": 200,
      "question": "Buzz Bunny hops one step at a time up or down a set of stairs. In how many ways can Buzz start on the ground, make a sequence of 6 hops, and end up back on the ground? (For example, one sequence of hops is up-up-down-down-up-down.)",
      "answer": "5",
      "attempts": 4,
      "image": null
  },
  {
      "id": 39,
      "category": "Hard",
      "cost": 200,
      "question": "Six cards and six envelopes are numbered 1, 2, 3, 4, 5, 6, and cards are to be placed in envelopes so that each envelope contains exactly one card and no card is placed in the envelope bearing the same number and moreover the card numbered 1 is always placed in envelope numbered 2. Then the number of ways it can be done is",
      "answer": "53",
      "attempts": 4,
      "image": null
  },
  // Hard Questions (Cost: 200 points each, 4 attempts)
  {
      "id": 40,
      "category": "Hard",
      "cost": 200,
      "question": "Find the no. of differences in the two images.",
      "answer": "5",
      "attempts": 4,
      "image": "/images/question40.jpg"
  },
  {
      "id": 41,
      "category": "Hard",
      "cost": 200,
      "question": "Charlotte (the little spider at node C) needs to catch the Queen spider (at node A). Both spiders can move a distance of exactly one unit on their turn and time taken in each turn is 1 second.Queen spider can move only forward or downward .Queen spider takes the first turn. Turns cannot be skipped. What will be the maximum time Queen spider can survive ?",
      "answer": "8",
      "attempts": 4,
      "image": "/images/question41.jpg"
  },
  {
      "id": 42,
      "category": "Hard",
      "cost": 200,
      "question": "f(1) = 2 f(2) = 12 f(3) = 72 f(4) = 600 f(5) = ?",
      "answer": "6120",
      "attempts": 4,
      "image": null
  },
  {
      "id": 43,
      "category": "Hard",
      "cost": 200,
      "question": "Given that certain sequences of the characters '\\0', '\\n', and '\\t' correspond to the following values:\n\n For '\\0' '\\n' '\\t' '\\t', the value is 55.\n For '\\0' '\\t' '\\n' '\\t' '\\n' '\\t', the value is 141.\n\nFind the value equivalent to\n'\\t' '\\n' '\\n' '\\t' '\\0' '\\n' '\\0' '\\n' .",
      "answer": "177",
      "attempts": 4,
      "image": null
  },
  {
      "id": 44,
      "category": "Hard",
      "cost": 200,
      "question": "Break the given I.P. address 192.168.1.45 into its octets . Following operations are performed : \n(1) Two smallest decimal value octets will be left shifted and \n(2) remaining decimal octets will be right shifted. \n(3) now , the two smallest modified octets values will be OR which results is X, \n(4) and the remaining two will be AND and the result is Y. \n\nThen calculate X (XNOR) Y .",
      "answer": "233",
      "attempts": 4,
      "image": null
  },
  {
      "id": 45,
      "category": "Hard",
      "cost": 200,
      "question": "You are in a dungeon with 7 rooms in sequence. Each room contains a key that may open one or more future doors.  Only 3 keys can be carried at a time. Some keys are decoys: using them opens a trap and sends you back two rooms.  \nDetermine minimum steps to reach the final room.",
      "answer": "10",
      "attempts": 4,
      "image": null
  },
  {
      "id": 46,
      "category": "Hard",
      "cost": 200,
      "question": "2 , 6 , 66 , k . Find k?",
      "answer": "8646",
      "attempts": 4,
      "image": null
  },
  {
      "id": 47,
      "category": "Hard",
      "cost": 200,
      "question": "In a certain code language, the word MANGO is written as ZAZKZ and TASK is written as NAJS. Using the same coding rule, how would the word SHOWER be written?",
      "answer": "lobqfe",
      "attempts": 4,
      "image": null
  },
  {
      "id": 48,
      "category": "Hard",
      "cost": 200,
      "question": "There are 100 bottles arranged in order from 1 to 100.\nExactly 10 of these bottles contain poison, and the rest contain pure water.\n\n\tYou have 10 people available for testing.\n\tThe testing process follows these rules:\n\n\tIn each round, every living person drinks from one distinct bottle (so 10 bottles in the first round).\n\n\t1]If a person drinks from a poisoned bottle, they die instantly.\n\t2]No new people are added in later rounds — once a person dies.\n\t3]Bottles tested in any round are discarded and not used again.\n\t4]Any Number of peoples can die in any rounds.\n\t4]Process ends when all 10 poisoned bottles found.\n\n\tWhat is the maximum number of rounds required in the worst case to find all 10 poisoned bottles under these conditions?",
      "answer": "91",
      "attempts": 4,
      "image": null
  },
  {
      "id": 49,
      "category": "Hard",
      "cost": 200,
      "question": " Given code for pattern :-\n\n\t#include <stdio.h>\n\n\tint main() {\n    \t   int n;\n\n           for (int i = 1; i <= n; i++) {\n                for (int j = 1; j <= n - i; j++)\n            \t\tprintf(\" \");\n                for (int j = 1; j <= 2*i - 1; j++)\n            \t\tprintf(\"\");\n        \tprintf(\"\\n\");\n            }\n\n           for (int i = n-1; i >= 1; i--) {\n          \tfor (int j = 1; j <= n - i; j++)\n            \t\tprintf(\" \");\n          \tfor (int j = 1; j <= 2*i - 1; j++)\n            \t\tprintf(\"\");\n                printf(\"\\n\");\n            }\n\n    \treturn 0;\n\t}\n\t\n\tFind area of the pattern formed for n = 9 ;where distance between two consecutive \n\thorizontal stars is 1 unit and vertical diagonal length is (n-1) ?",
      "answer": "64",
      "attempts": 4,
      "image": null
  },
  {
      "id": 50,
      "category": "Hard",
      "cost": 200,
      "question": "For a given code:-\n\n        #include <stdio.h>\n\n        void f3(int n ){\n                      if(n ==0 )return;\n                printf(n+1);\n                f1(n-1);\n                return;\n        }\n\n        void f2(int n){\n                if(n == 0)return;\n                printf(n+2);\n                f3(n-1);\n                f1(n-1);\n                return;\n        }\n        \n        void f1(int n){\n                if(n ==0 )return;\n                printf(n);\n                f2(n-1);\n                return;\n        }\n                \n        int main() {\n                int n;\n                \n                f1(n);\n        return 0;\n        }\n\n        Given code result a sequence of numbers , find the square of sum of square of digits of it for n = 5.",
      "answer": "14400",
      "attempts": 4,
      "image": null
  }
];

const QuestionBank = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [points, setPoints] = useState(0);
  const [questions, setQuestions] = useState(QUESTION_BANK.map(q => ({
    ...q,
    image: q.image || null, // Add image field
    purchased: false,
    unlocked: false,
    solved: false,
    attempted: false,
    attemptsUsed: 0,
    currentAnswer: '',
    answerError: ''
  })));

  // Load team data
  useEffect(() => {
    const storedTeam = localStorage.getItem('team');
    if (storedTeam) {
      const parsedTeam = JSON.parse(storedTeam);
      setTeam(parsedTeam);
      setPoints(parsedTeam.totalPoints || 0);
      
      // Load question states from localStorage
      const savedQuestions = localStorage.getItem(`questions-${parsedTeam._id}`);
      if (savedQuestions) {
        const saved = JSON.parse(savedQuestions);
        setQuestions(prev => prev.map(q => {
          const savedQ = saved.find(sq => sq.id === q.id);
          return savedQ ? { ...q, ...savedQ } : q;
        }));
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Save question states to localStorage
  const saveQuestionStates = (updatedQuestions) => {
    if (team) {
      localStorage.setItem(`questions-${team._id}`, JSON.stringify(updatedQuestions));
    }
  };

  // Purchase a question
  const handlePurchase = async (questionId) => {
    const question = questions.find(q => q.id === questionId);
    // Allow purchase if not purchased OR if attempts exhausted (can repurchase)
    if (!question || (question.purchased && question.unlocked && !question.solved) || points < question.cost) return;

    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        // Reset attempts when repurchasing
        return { 
          ...q, 
          purchased: true, 
          unlocked: true,
          attemptsUsed: 0,
          currentAnswer: '',
          answerError: ''
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    saveQuestionStates(updatedQuestions);

    // Deduct points
    const newPoints = points - question.cost;
    setPoints(newPoints);
    
    try {
      await updateTeamPoints(team._id, -question.cost);
      const updatedTeam = { ...team, totalPoints: newPoints };
      setTeam(updatedTeam);
      localStorage.setItem('team', JSON.stringify(updatedTeam));
    } catch (err) {
      console.error('Failed to update points:', err);
    }
  };

  // Submit answer
  const handleAnswerSubmit = async (questionId, answer) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.unlocked || question.solved) return;

    // Convert to lowercase and trim spaces for comparison
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrectAnswer = question.answer.trim().toLowerCase();
    const isCorrect = normalizedAnswer === normalizedCorrectAnswer;
    const newAttemptsUsed = question.attemptsUsed + 1;
    const maxAttempts = question.attempts;

    let updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        if (isCorrect) {
          // Correct answer - award double points and mark as solved
          const pointsToAward = question.cost * 2;
          return {
            ...q,
            solved: true,
            attemptsUsed: newAttemptsUsed,
            currentAnswer: '',
            answerError: ''
          };
        } else {
          // Wrong answer
          const attemptsExhausted = newAttemptsUsed >= maxAttempts;
          return {
            ...q,
            attemptsUsed: newAttemptsUsed,
            attempted: true,
            // If attempts exhausted, make it available for purchase again
            unlocked: !attemptsExhausted,
            purchased: !attemptsExhausted, // Reset purchased flag when attempts exhausted
            currentAnswer: '',
            answerError: attemptsExhausted 
              ? `Incorrect! Maximum attempts (${maxAttempts}) reached. You can purchase this question again.`
              : `Incorrect! Attempts remaining: ${maxAttempts - newAttemptsUsed}`
          };
        }
      }
      return q;
    });

    setQuestions(updatedQuestions);
    saveQuestionStates(updatedQuestions);

    if (isCorrect) {
      // Award double points
      const pointsToAward = question.cost * 2;
      const newPoints = points + pointsToAward;
      setPoints(newPoints);
      
      try {
        await updateTeamPoints(team._id, pointsToAward);
        await updateSolvedQuestions(team._id);
        const updatedTeam = { ...team, totalPoints: newPoints };
        setTeam(updatedTeam);
        localStorage.setItem('team', JSON.stringify(updatedTeam));
      } catch (err) {
        console.error('Failed to update points:', err);
      }
    }
  };

  // Handle answer input change
  const handleAnswerChange = (questionId, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, currentAnswer: value, answerError: '' };
      }
      return q;
    }));
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Easy': return { bg: '#dcfce7', text: '#166534', border: '#22c55e' };
      case 'Medium': return { bg: '#fef9c3', text: '#854d0e', border: '#eab308' };
      case 'Hard': return { bg: '#fee2e2', text: '#b91c1c', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };
    }
  };

  // Filter questions by category
  const easyQuestions = questions.filter(q => q.category === 'Easy');
  const mediumQuestions = questions.filter(q => q.category === 'Medium');
  const hardQuestions = questions.filter(q => q.category === 'Hard');

  if (!team) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f8f5' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0e201b', marginBottom: '0.25rem' }}>Round 2 - Question Bank</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Team: {team.teamName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Available Points</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00895e', margin: 0 }}>{points}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Solved Questions</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00895e', margin: 0 }}>
                {questions.filter(q => q.solved).length} / {questions.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0e201b', marginBottom: '0.5rem' }}>
            Round 2 - Choose Your Questions Strategically
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            You have {points} points from Round 1. Use them wisely!
          </p>
          <p style={{ color: '#6b7280' }}>
            Purchase questions with your points. Answer correctly within attempts to earn double the purchase cost!
          </p>
        </div>

        {/* Easy Questions */}
        <section style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0e201b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
              Easy Questions
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              (Cost: 50 points | Attempts: 2)
            </span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {easyQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                points={points}
                onPurchase={handlePurchase}
                onAnswerChange={handleAnswerChange}
                onAnswerSubmit={handleAnswerSubmit}
                categoryColor={getCategoryColor(question.category)}
              />
            ))}
          </div>
        </section>

        {/* Medium Questions */}
        <section style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0e201b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fef9c3', color: '#854d0e', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
              Medium Questions
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              (Cost: 100 points | Attempts: 3)
            </span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {mediumQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                points={points}
                onPurchase={handlePurchase}
                onAnswerChange={handleAnswerChange}
                onAnswerSubmit={handleAnswerSubmit}
                categoryColor={getCategoryColor(question.category)}
              />
            ))}
          </div>
        </section>

        {/* Hard Questions */}
        <section style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0e201b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
              Hard Questions
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              (Cost: 200 points | Attempts: 4)
            </span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {hardQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                points={points}
                onPurchase={handlePurchase}
                onAnswerChange={handleAnswerChange}
                onAnswerSubmit={handleAnswerSubmit}
                categoryColor={getCategoryColor(question.category)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// Helper function to format question text with code blocks
const formatQuestionText = (text) => {
  if (!text) return '';
  
  // Check if text contains code blocks (indicated by #include, void, int main, etc.)
  const codeIndicators = ['#include', 'void', 'int main', 'printf', 'for (', 'if (', 'return'];
  const hasCode = codeIndicators.some(indicator => text.includes(indicator));
  
  if (hasCode) {
    // Split by lines and format
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check if line looks like code
      const isCodeLine = line.trim().startsWith('#') || 
                        line.trim().startsWith('void') || 
                        line.trim().startsWith('int ') ||
                        line.trim().startsWith('for ') ||
                        line.trim().startsWith('if ') ||
                        line.trim().startsWith('printf') ||
                        line.trim().startsWith('return') ||
                        line.trim().startsWith('}') ||
                        line.trim().startsWith('{') ||
                        (line.includes('(') && line.includes(')') && line.includes(';'));
      
      if (isCodeLine) {
        return (
          <pre key={index} style={{
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            overflowX: 'auto',
            margin: '0.5rem 0',
            lineHeight: '1.5',
            whiteSpace: 'pre',
            tabSize: 2
          }}>
            {line}
          </pre>
        );
      }
      return <span key={index}>{line}{index < lines.length - 1 ? '\n' : ''}</span>;
    });
  }
  
  // Regular text - preserve line breaks
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

// Question Card Component
const QuestionCard = ({ question, points, onPurchase, onAnswerChange, onAnswerSubmit, categoryColor }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.currentAnswer.trim() && question.unlocked && !question.solved) {
      onAnswerSubmit(question.id, question.currentAnswer);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: question.solved ? `2px solid #22c55e` : question.attempted && !question.unlocked && !question.solved ? `2px solid #f59e0b` : `1px solid #e5e7eb`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'box-shadow 0.3s'
    }}>
      {/* Card Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: categoryColor.bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              borderRadius: '0.25rem',
              backgroundColor: categoryColor.bg,
              color: categoryColor.text,
              border: `1px solid ${categoryColor.border}`
            }}>
              {question.category}
            </span>
            {question.solved && (
              <span style={{
                display: 'inline-block',
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '0.25rem',
                backgroundColor: '#dcfce7',
                color: '#166534'
              }}>
                ✓ Solved
              </span>
            )}
            {question.attempted && !question.unlocked && !question.solved && (
              <span style={{
                display: 'inline-block',
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '0.25rem',
                backgroundColor: '#fef3c7',
                color: '#854d0e'
              }}>
                🔄 Available for Purchase
              </span>
            )}
          </div>
          <div style={{
            backgroundColor: '#00895e',
            color: 'white',
            borderRadius: '9999px',
            width: '3rem',
            height: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            {question.cost}
          </div>
        </div>
        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0e201b', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
          {formatQuestionText(question.question)}
        </div>
        {/* Display image only if purchased and unlocked (not locked after attempts) */}
        {question.image && question.purchased && question.unlocked && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <img 
              src={question.image} 
              alt="Question illustration" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px', 
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '1rem' }}>
        {!question.purchased || (question.attempted && !question.unlocked && !question.solved) ? (
          // Locked State - Purchase Button (or Available for Repurchase)
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {question.attempted && !question.unlocked 
                ? 'Attempts exhausted. Purchase again to retry.' 
                : 'Purchase this question to unlock it'}
            </p>
            <button
              onClick={() => onPurchase(question.id)}
              disabled={points < question.cost}
              style={{
                width: '100%',
                backgroundColor: points >= question.cost ? '#00895e' : '#9ca3af',
                color: 'white',
                fontWeight: '500',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: points >= question.cost ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.3s'
              }}
            >
              {points >= question.cost ? `Purchase for ${question.cost} points` : `Insufficient points (Need ${question.cost})`}
            </button>
          </div>
        ) : question.solved ? (
          // Solved State
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '0.375rem' }}>
            <div style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.125rem' }}>
              ✓ Correct Answer!
            </div>
            <p style={{ color: '#166534', fontSize: '0.875rem' }}>
              You earned {question.cost * 2} points!
            </p>
            <p style={{ color: '#166534', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Answer: {question.answer}
            </p>
          </div>
        ) : (
          // Active State - Answer Form
          <div>
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Attempts: {question.attemptsUsed} / {question.attempts}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label htmlFor={`answer-${question.id}`} style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.25rem' }}>
                  Your Answer
                </label>
                <input
                  id={`answer-${question.id}`}
                  type="text"
                  value={question.currentAnswer}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: question.answerError ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  placeholder="Enter your answer"
                  disabled={question.solved || !question.unlocked}
                />
                {question.answerError && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {question.answerError}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!question.currentAnswer.trim() || question.solved || !question.unlocked}
                style={{
                  width: '100%',
                  backgroundColor: '#00895e',
                  color: 'white',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: question.currentAnswer.trim() && !question.solved && question.unlocked ? 'pointer' : 'not-allowed',
                  opacity: question.currentAnswer.trim() && !question.solved && question.unlocked ? 1 : 0.7
                }}
              >
                Submit Answer
              </button>
            </form>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
              Correct answer rewards: {question.cost * 2} points
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;

