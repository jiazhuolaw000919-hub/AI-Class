LawAIApp.Data = {
  generateLessons() {
    const topics = [
      "Introduction to AI", "Machine Learning Basics", "Neural Networks", "Deep Learning",
      "Computer Vision", "NLP", "Reinforcement Learning", "GANs", "Transformers",
      "Prompt Engineering", "AI Ethics", "AI in Healthcare", "AI in Law", "AI Tools",
      "Data Preprocessing", "Model Evaluation", "Overfitting", "Regularization",
      "Transfer Learning", "Time Series", "Recommendation Systems", "Anomaly Detection",
      "Explainable AI", "Deployment", "MLOps", "AI Safety", "Bias in AI", "Edge AI"
    ];
    const lessons = [];
    for (let i = 0; i < 365; i++) {
      const topic = topics[i % topics.length] + (i >= topics.length ? ` - Part ${Math.floor(i/topics.length)+1}` : "");
      lessons.push({
        id: i+1,
        title: `Day ${i+1}: ${topic}`,
        duration: Math.floor(Math.random() * 15) + 5 + " min",
        content: `Lesson content for day ${i+1}.`
      });
    }
    return lessons;
  },

  fakeUser() {
    return {
      name: "Law",
      xp: 2840,
      level: 12,
      streak: 7,
      completedLessons: [1,2,3,5,8],
      currentLesson: 9
    };
  },

  fakeNotes() {
    return [
      { id:1, title:"Prompt Engineering Tips", summary:"Best practices for crafting prompts...", tags:["AI","Prompt"], date:"2026-06-28" },
      { id:2, title:"Understanding CNNs", summary:"Convolutional layers explained...", tags:["Vision","Deep Learning"], date:"2026-06-27" },
      { id:3, title:"AI in Legal Research", summary:"How AI transforms case analysis...", tags:["Law","NLP"], date:"2026-06-25" }
    ];
  },

  weeklyChallenge() {
    return { title: "Build a mini chatbot", xp: 500, progress: 40 };
  }
};
