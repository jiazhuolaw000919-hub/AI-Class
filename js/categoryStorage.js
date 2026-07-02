// categoryStorage.js
LawAIApp.CategoryStorage = {
  _getAll() {
    let list = LawAIApp.StorageEngine.get('category_list');
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = JSON.parse(JSON.stringify(LawAIApp.CategoryData.categories)); // 深拷贝
      LawAIApp.StorageEngine.set('category_list', list);
    }
    // 保证每个对象都有 updatedAt / createdAt
    list.forEach(c => {
      c.createdAt = c.createdAt || new Date().toISOString();
      c.updatedAt = c.updatedAt || new Date().toISOString();
    });
    return list;
  },

  _saveAll(list) {
    LawAIApp.StorageEngine.set('category_list', list);
  },

  // 获取可见的分类（status=active, enabled=true）
  getActiveCategories() {
    return this._getAll().filter(c => c.status === 'active' && c.enabled);
  },

  // 搜索：按名称、显示名称、描述
  search(query) {
    const q = query.toLowerCase();
    return this._getAll().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.displayName.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  },

  // 设置选中分类（供未来筛选器使用）
  setSelectedCategory(id) {
    LawAIApp.StorageEngine.set('selected_category', id);
  },

  getSelectedCategoryId() {
    return LawAIApp.StorageEngine.get('selected_category', null);
  },

  // 收藏
  toggleFavorite(id) {
    let favs = LawAIApp.StorageEngine.get('favorite_categories', []);
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id);
    else favs.splice(idx, 1);
    LawAIApp.StorageEngine.set('favorite_categories', favs);
    return favs;
  },

  isFavorite(id) {
    const favs = LawAIApp.StorageEngine.get('favorite_categories', []);
    return favs.includes(id);
  }
};
