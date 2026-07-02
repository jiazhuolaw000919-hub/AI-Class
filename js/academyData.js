// academyData.js
LawAIApp.AcademyData = {
  academies: [
    {
      id: 'ai',
      title: 'AI Academy',
      icon: '🤖',
      description: 'Master Artificial Intelligence from fundamentals to advanced.',
      status: 'active',
      totalLessons: 365,
      difficulty: 'Beginner to Advanced',
      estimatedHours: 48,
      comingSoon: false,
      favorite: false
    },
    {
      id: 'programming',
      title: 'Programming Academy',
      icon: '💻',
      description: 'Learn coding from scratch with modern languages.',
      status: 'coming_soon',
      totalLessons: 0,
      difficulty: 'Beginner',
      estimatedHours: 0,
      comingSoon: true,
      favorite: false
    },
    {
      id: 'hardware',
      title: 'Computer Hardware Academy',
      icon: '🖥️',
      description: 'Understand how computers work inside out.',
      status: 'coming_soon',
      totalLessons: 0,
      difficulty: 'Beginner',
      estimatedHours: 0,
      comingSoon: true,
      favorite: false
    },
    {
      id: 'automotive',
      title: 'Automotive Academy',
      icon: '🚗',
      description: 'Dive into car mechanics and modern automotive tech.',
      status: 'coming_soon',
      totalLessons: 0,
      difficulty: 'Beginner',
      estimatedHours: 0,
      comingSoon: true,
      favorite: false
    },
    {
      id: 'finance',
      title: 'Finance & Economics Academy',
      icon: '💰',
      description: 'Build financial literacy and economic thinking.',
      status: 'coming_soon',
      totalLessons: 0,
      difficulty: 'Beginner',
      estimatedHours: 0,
      comingSoon: true,
      favorite: false
    },
    {
      id: 'health',
      title: 'Health Academy',
      icon: '❤️',
      description: 'Learn about physical and mental well‑being.',
      status: 'coming_soon',
      totalLessons: 0,
      difficulty: 'Beginner',
      estimatedHours: 0,
      comingSoon: true,
      favorite: false
    },
    {
      id: 'nutrition',
      title: 'Nutrition Academy',
      icon: '🥗',
      description: 'Master the science of food and diet.',
      status: 'coming_soon',
      totalLessons: 0,
      difficulty: 'Beginner',
      estimatedHours: 0,
      comingSoon: true,
      favorite: false
    },
    {
      id: 'english',
      title: 'English Academy',
      icon: '🇬🇧',
      description: 'Improve your English language skills.',
      status: 'coming_soon',
      totalLessons: 0,
      difficulty: 'Beginner',
      estimatedHours: 0,
      comingSoon: true,
      favorite: false
    }
  ],

  getAcademyById(id) {
    return this.academies.find(a => a.id === id) || null;
  }
};
