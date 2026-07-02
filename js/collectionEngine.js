// collectionEngine.js
LawAIApp.CollectionEngine = (function() {
  let collections = LawAIApp.StorageEngine.get('collections', { books: [], artifacts: [] });

  function save() {
    LawAIApp.StorageEngine.set('collections', collections);
  }

  function addBook(book) {
    if (!collections.books.find(b => b.id === book.id)) {
      collections.books.push({ ...book, acquiredAt: new Date().toISOString() });
      save();
      LawAIApp.EventBus.emit('CollectionUpdated', { type: 'book', book });
    }
  }

  function getBooks() {
    return [...collections.books];
  }

  // 完成课程时自动添加知识书籍
  LawAIApp.EventBus.on('CourseCompleted', (data) => {
    addBook({ id: `book_${data.courseId}`, title: `Knowledge Book: ${data.courseId}` });
  });

  // 完成模块时添加小书籍
  LawAIApp.EventBus.on('ModuleCompleted', (data) => {
    addBook({ id: `book_module_${data.moduleId}`, title: `Module Guide: ${data.moduleId}` });
  });

  return { addBook, getBooks, getCollections: () => ({ ...collections }) };
})();
