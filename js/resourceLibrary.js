// resourceLibrary.js
LawAIApp.ResourceLibrary = {
  // 示例资源库（未来可从学习包加载）
  library: [
    { id:'res1', title:'What is AI? – Official Guide', type:'article', category:'AI Basics', difficulty:'Beginner', estimatedTime:10, tags:['AI','Definition'], url:'https://example.com/ai-guide', source:'OpenAI', moduleId:'module_ai_intro', lessonId:'module_ai_intro_lesson1' },
    { id:'res2', title:'AI vs Automation – Video', type:'video', category:'AI Basics', difficulty:'Beginner', estimatedTime:8, tags:['Automation','Comparison'], url:'https://example.com/ai-vs-automation', source:'YouTube', moduleId:'module_ai_intro', lessonId:'module_ai_intro_lesson2' },
    { id:'res3', title:'History of AI – Article', type:'article', category:'AI History', difficulty:'Intermediate', estimatedTime:12, tags:['History','Timeline'], url:'https://example.com/ai-history', source:'Wikipedia', moduleId:'module_ai_history' },
    { id:'res4', title:'Prompt Engineering Cheat Sheet', type:'cheat_sheet', category:'Prompt Engineering', difficulty:'Intermediate', estimatedTime:5, tags:['Prompt','Cheat Sheet'], url:'https://example.com/prompt-cheatsheet', source:'Law Academy', moduleId:null },
    { id:'res5', title:'AI Ethics in Practice', type:'article', category:'AI Ethics', difficulty:'Advanced', estimatedTime:15, tags:['Ethics','Responsible AI'], url:'https://example.com/ai-ethics', source:'Google AI', moduleId:null }
  ],

  // 获取所有资源
  getAll() {
    return this.library;
  },

  // 根据课程/模块筛选
  getByModule(moduleId) {
    return this.library.filter(r => r.moduleId === moduleId);
  },

  // 搜索
  search(query, filters = {}) {
    let results = this.library;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filters.type) results = results.filter(r => r.type === filters.type);
    if (filters.difficulty) results = results.filter(r => r.difficulty === filters.difficulty);
    return results;
  }
};
