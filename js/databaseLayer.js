// ===========================================
// databaseLayer.js
// 模拟 Supabase 客户端，使用 LocalStorage 作为后备
// 未来只需修改连接字符串即可切换到真实 Supabase
// ===========================================
LawAIApp.Database = {
  // 模拟查询构建器
  from(table) {
    return new LawAIApp.QueryBuilder(table);
  },
  // 真实 Supabase 连接（注释掉）
  // supabase: null, // 将来使用 supabase.createClient(url, key)
};

// 查询构建器类
LawAIApp.QueryBuilder = class {
  constructor(table) {
    this.table = table;
    this._filters = [];
    this._data = null;
  }

  // 获取所有数据
  async select(columns = '*') {
    const key = `db_${this.table}`;
    let rows = LawAIApp.StorageEngine.get(key, []);
    if (this._filters.length > 0) {
      rows = rows.filter(row => this._filters.every(f => f(row)));
    }
    return { data: rows, error: null };
  }

  // 插入新记录
  async insert(record) {
    const key = `db_${this.table}`;
    const rows = LawAIApp.StorageEngine.get(key, []);
    record.id = record.id || this._generateUUID();
    record.created_at = record.created_at || new Date().toISOString();
    rows.push(record);
    LawAIApp.StorageEngine.set(key, rows);
    return { data: [record], error: null };
  }

  // 更新记录
  async update(record, matchColumn = 'id') {
    const key = `db_${this.table}`;
    let rows = LawAIApp.StorageEngine.get(key, []);
    const idx = rows.findIndex(r => r[matchColumn] === record[matchColumn]);
    if (idx !== -1) {
      rows[idx] = { ...rows[idx], ...record };
      LawAIApp.StorageEngine.set(key, rows);
      return { data: [rows[idx]], error: null };
    }
    return { data: null, error: 'Record not found' };
  }

  // 条件过滤
  eq(column, value) {
    this._filters.push(row => row[column] === value);
    return this;
  }

  // 私有：生成简单 UUID
  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
};
