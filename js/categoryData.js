// categoryData.js
LawAIApp.CategoryData = {
  categories: [
    // 顶层
    { id: 'cat_technology', name: 'technology', displayName: 'Technology', description: 'Everything tech', icon: '💻', color: '#3b82f6', parentCategory: null, order: 1, enabled: true, status: 'active' },
    { id: 'cat_finance', name: 'finance', displayName: 'Finance', description: 'Money, markets & economics', icon: '💰', color: '#ef4444', parentCategory: null, order: 2, enabled: true, status: 'active' },
    { id: 'cat_health', name: 'health', displayName: 'Health', description: 'Physical & mental well-being', icon: '❤️', color: '#ec4899', parentCategory: null, order: 3, enabled: true, status: 'active' },
    { id: 'cat_automotive', name: 'automotive', displayName: 'Automotive', description: 'Cars & mechanics', icon: '🚗', color: '#f59e0b', parentCategory: null, order: 4, enabled: true, status: 'active' },
    { id: 'cat_language', name: 'language', displayName: 'Language', description: 'Learn languages', icon: '🇬🇧', color: '#6366f1', parentCategory: null, order: 5, enabled: true, status: 'active' },
    { id: 'cat_business', name: 'business', displayName: 'Business', description: 'Entrepreneurship & management', icon: '📈', color: '#10b981', parentCategory: null, order: 6, enabled: true, status: 'active' },
    { id: 'cat_productivity', name: 'productivity', displayName: 'Productivity', description: 'Get things done', icon: '⚡', color: '#f97316', parentCategory: null, order: 7, enabled: true, status: 'active' },
    { id: 'cat_career', name: 'career', displayName: 'Career', description: 'Professional growth', icon: '💼', color: '#8b5cf6', parentCategory: null, order: 8, enabled: true, status: 'active' },
    // 子分类 (Technology 下)
    { id: 'cat_ai', name: 'artificial_intelligence', displayName: 'Artificial Intelligence', description: 'AI, ML & deep learning', icon: '🤖', color: '#3b82f6', parentCategory: 'cat_technology', order: 10, enabled: true, status: 'active' },
    { id: 'cat_programming', name: 'programming', displayName: 'Programming', description: 'Coding & software', icon: '💻', color: '#22c55e', parentCategory: 'cat_technology', order: 11, enabled: true, status: 'active' },
    { id: 'cat_hardware', name: 'computer_hardware', displayName: 'Computer Hardware', description: 'PCs, components & architecture', icon: '🖥️', color: '#8b5cf6', parentCategory: 'cat_technology', order: 12, enabled: true, status: 'active' },
    // 子分类 (Finance 下)
    { id: 'cat_economics', name: 'economics', displayName: 'Economics', description: 'Micro & macro economics', icon: '📉', color: '#ef4444', parentCategory: 'cat_finance', order: 13, enabled: true, status: 'active' },
    // 子分类 (Health 下)
    { id: 'cat_nutrition', name: 'nutrition', displayName: 'Nutrition', description: 'Food science', icon: '🥗', color: '#10b981', parentCategory: 'cat_health', order: 14, enabled: true, status: 'active' },
    // 子分类 (Language 下)
    { id: 'cat_english', name: 'english', displayName: 'English', description: 'English language', icon: '🇬🇧', color: '#6366f1', parentCategory: 'cat_language', order: 15, enabled: true, status: 'active' }
  ],

  getById(id) {
    return this.categories.find(c => c.id === id) || null;
  },

  getByParentId(parentId) {
    return this.categories.filter(c => c.parentCategory === parentId);
  }
};
