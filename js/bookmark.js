// bookmark.js
LawAIApp.Bookmark = {
  getBookmarks(type = 'lesson') {
    return LawAIApp.StorageEngine.get(`bookmarks_${type}`, []);
  },

  toggle(lessonId, type = 'lesson') {
    const list = this.getBookmarks(type);
    const idx = list.indexOf(lessonId);
    if (idx === -1) list.push(lessonId);
    else list.splice(idx, 1);
    LawAIApp.StorageEngine.set(`bookmarks_${type}`, list);
    return list;
  },

  isBookmarked(lessonId, type = 'lesson') {
    return this.getBookmarks(type).includes(lessonId);
  }
};
