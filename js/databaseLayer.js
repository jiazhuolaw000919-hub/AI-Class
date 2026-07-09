// ===========================================
// databaseLayer.js
// 模拟 Supabase 客户端，使用 LocalStorage 作为后备
// Season 4 Chapter 1 升级版
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.Database = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('🗄️ Database layer initialized');
        return this;
    },

    from: function(table) {
        return new LawAIApp.QueryBuilder(table);
    }
};

LawAIApp.QueryBuilder = class {
    constructor(table) {
        this.table = table;
        this._filters = [];
        this._limitVal = null;
        this._orderByVal = null;
    }

    async select(columns) {
        columns = columns || '*';
        var key = 'db_' + this.table;
        var rows = [];
        try {
            rows = LawAIApp.StorageEngine?.get?.(key) || [];
        } catch (e) {}

        if (this._filters.length > 0) {
            rows = rows.filter(function(row) {
                return this._filters.every(function(f) { return f(row); });
            }.bind(this));
        }

        if (this._orderByVal) {
            var order = this._orderByVal;
            rows.sort(function(a, b) {
                var va = a[order.column] || 0;
                var vb = b[order.column] || 0;
                return order.direction === 'desc' ? vb - va : va - vb;
            });
        }

        if (this._limitVal) {
            rows = rows.slice(0, this._limitVal);
        }

        return { data: rows, error: null };
    }

    async insert(record) {
        var key = 'db_' + this.table;
        var rows = [];
        try {
            rows = LawAIApp.StorageEngine?.get?.(key) || [];
        } catch (e) {}

        record.id = record.id || this._generateUUID();
        record.created_at = record.created_at || new Date().toISOString();
        rows.push(record);

        try {
            LawAIApp.StorageEngine?.set?.(key, rows);
        } catch (e) {}

        return { data: [record], error: null };
    }

    async update(record, matchColumn) {
        matchColumn = matchColumn || 'id';
        var key = 'db_' + this.table;
        var rows = [];
        try {
            rows = LawAIApp.StorageEngine?.get?.(key) || [];
        } catch (e) {}

        var idx = -1;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i][matchColumn] === record[matchColumn]) {
                idx = i;
                break;
            }
        }

        if (idx !== -1) {
            rows[idx] = { ...rows[idx], ...record };
            try {
                LawAIApp.StorageEngine?.set?.(key, rows);
            } catch (e) {}
            return { data: [rows[idx]], error: null };
        }
        return { data: null, error: 'Record not found' };
    }

    async delete(matchColumn, value) {
        var key = 'db_' + this.table;
        var rows = [];
        try {
            rows = LawAIApp.StorageEngine?.get?.(key) || [];
        } catch (e) {}

        var filtered = rows.filter(function(row) {
            return row[matchColumn] !== value;
        });

        try {
            LawAIApp.StorageEngine?.set?.(key, filtered);
        } catch (e) {}

        return { data: filtered, error: null };
    }

    eq: function(column, value) {
        this._filters.push(function(row) { return row[column] === value; });
        return this;
    }

    neq: function(column, value) {
        this._filters.push(function(row) { return row[column] !== value; });
        return this;
    }

    gt: function(column, value) {
        this._filters.push(function(row) { return row[column] > value; });
        return this;
    }

    lt: function(column, value) {
        this._filters.push(function(row) { return row[column] < value; });
        return this;
    }

    limit: function(val) {
        this._limitVal = val;
        return this;
    }

    order: function(column, direction) {
        this._orderByVal = { column: column, direction: direction || 'asc' };
        return this;
    }

    _generateUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.Database && typeof LawAIApp.Database.init === 'function') {
        LawAIApp.Database.init();
    }
}, 100);

console.log('🗄️ DatabaseLayer V2.0 ready');
