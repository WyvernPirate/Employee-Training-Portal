
// Mock data for the employee dashboard

export const trainingVideos = [
  {
    id: 1,
    title: "Introduction to Brake Systems",
    description: "Learn about the fundamentals of automotive brake systems.",
    duration: "45 minutes",
    department: "Mechanical",
    completed: true,
    thumbnail: "https://placeholder.pics/svg/300x200/DEDEDE/555555/Brake%20Systems"
  },
  {
    id: 2,
    title: "Understanding Transmission Components",
    description: "Detailed overview of transmission systems and parts.",
    duration: "60 minutes",
    department: "Mechanical",
    completed: false,
    thumbnail: "https://placeholder.pics/svg/300x200/DEDEDE/555555/Transmission"
  },
  {
    id: 3,
    title: "Electrical Systems in Modern Vehicles",
    description: "Explore the electrical components in contemporary automotive design.",
    duration: "55 minutes",
    department: "Electrical",
    completed: false,
    thumbnail: "https://placeholder.pics/svg/300x200/DEDEDE/555555/Electrical"
  }
];

export const certificates = [
  {
    id: 1,
    title: "Brake Systems Specialist",
    issueDate: "2023-05-15",
    expiryDate: "2024-05-15",
    course: "Introduction to Brake Systems"
  }
];

export const assessments = [
  {
    id: 1,
    title: "Brake Systems Knowledge Test",
    description: "Test your knowledge of automotive brake systems",
    questions: 10,
    timeLimit: "15 minutes",
    course: "Introduction to Brake Systems",
    completed: false,
    score: null
  },
  {
    id: 2,
    title: "Brake Systems Practical Assessment",
    description: "Practical assessment on brake system maintenance",
    questions: 5,
    timeLimit: "30 minutes",
    course: "Introduction to Brake Systems",
    completed: true,
    score: "90%"
  }
];
