/* eslint-disable */

let g_store

class BookDb {

  constructor() {
    this.DB_NAME = 'XReader'
    this.BOOK_OBJECT = 'Book'
    this.BOOKMARK_OBJECT = 'BookMark'
    this.BOOKCOMMENT_OBJECT = 'BookComment'
  }

  init(cb) {
    var request = window.indexedDB.open(this.DB_NAME, 1);  // 打开 dbName 数据库
    request.onerror = function (e) {              // 监听连接数据库失败时执行
      console.log('连接数据库失败');
    }
    request.onsuccess = function (e) {            // 监听连接数据库成功时执行
      console.log('连接数据库成功');
    }

    request.onupgradeneeded = e => {
      var db = e.target.result;
      db.createObjectStore(this.BOOK_OBJECT, {keyPath: 'Book', autoIncrement: false});
      var objectStore = db.createObjectStore(this.BOOKMARK_OBJECT, {keyPath: 'UserName', autoIncrement: false});
      objectStore.createIndex("BookName", "BookName", {unique: false});
      objectStore.createIndex("BookMark", "BookMark", {unique: false});
      objectStore.createIndex("index", ['UserName', 'BookName'], {unique: false});
      var objectStore = db.createObjectStore(this.BOOKCOMMENT_OBJECT, {keyPath: 'UserName', autoIncrement: false});
      objectStore.createIndex("BookName", "BookName", {unique: false});
      objectStore.createIndex("BookComment", "BookComment", {unique: false});
      objectStore.createIndex("index", ['UserName', 'BookName'], {unique: false});
      console.log('创建对象仓库成功');
    }

  }

  openDB(DBname, objectName, mode, callback) {
    var request = window.indexedDB.open(DBname, 1);  // 打开 dbName 数据库
    request.onerror = function (e) {              // 监听连接数据库失败时执行
      console.log('连接数据库失败');
    }
    request.onsuccess = function (e) {            // 监听连接数据库成功时执行
      console.log('连接数据库成功');
    }
    request.onsuccess = e => {
      var db = e.target.result;
      if (mode == 0) {
        var tx = db.transaction(objectName, 'readwrite');
      }
      else {
        var tx = db.transaction(objectName, 'readonly');//数据加载时 需要用只读模式
      }
      g_store = tx.objectStore(objectName);
      callback && callback()
    }
  }

  init2() {
    var value = {
      'Book': '2',
      'userName': 'tt',
      'path': '/static/aaa'
    }
    var req1 = g_store.put(value);        // 保存数据

    var req2 = g_store.get('2');            // 获取索引userId为1的数据
    req2.onsuccess = function () {
      // console.log(this.result);    // linxin
    }

    var req3 = g_store.delete('2');             // 删除索引为1的数据
    req3.onsuccess = function () {
      console.log('删除数据成功');        // 删除数据成功
    }
  }

  test(value) {
    var request = window.indexedDB.open(this.DB_NAME, 1);  // 打开 dbName 数据库
    request.onerror = function (e) {              // 监听连接数据库失败时执行
      console.log('连接数据库失败');
    }
    request.onsuccess = function (e) {            // 监听连接数据库成功时执行
      console.log('连接数据库成功');
    }
    request.onsuccess = e => {
      var db = e.target.result;
      var tx = db.transaction(this.BOOK_OBJECT, 'readwrite');
      g_store = tx.objectStore(this.BOOK_OBJECT);
      var req1 = g_store.put(value);
    }

    // var req1 = g_store.put(value);
  }


  getBooks(cb) {
    var req = g_store.openCursor();
    var result = [];

    req.onsuccess = function (e) {
      var cursor = e.target.result;
      if (cursor) {
        result.push(cursor.value);
        cursor.continue();
      } else {
        cb && cb(result)
      }
    }
  }

  getBook(id, cb) {
    let req = g_store.get(id)
    req.onsuccess = e => {
      console.log('getBook')
      console.log(e.target.result)
      cb && cb(e.target.result)
    }
  }

  addBook(book, cb) {
    let req = g_store.put(book)
    req.onsuccess = () => {
      console.log('保存成功')
      cb && cb()
    }
  }

  deleteBook(id, cb) {
    let req = g_store.delete(id)
    req.onsuccess = () => {
      console.log('删除数据成功')
      cb && cb()
    }
  }

  getBookMark(index, cb) {
    var sindex = g_store.index('index');
    console.log(index);
    //var request = sindex.openCursor(IDBKeyRange.only(index));
    var request = sindex.get(IDBKeyRange.only(index));//获得第一个匹配数据

    request.onsuccess = e => {
      if (request.result) {
        var data = request.result.BookMark;
        cb && cb(data)
      }
    }
  }

  addBookMark(bookmark, cb) {
    console.log(bookmark)
    let req = g_store.put(bookmark)
    req.onsuccess = () => {
      console.log('保存成功')
      cb && cb()
    }
  }

  deleteBookMark(id, cb) {
    let req = g_store.delete(id)
    req.onsuccess = () => {
      console.log('删除数据成功')
      cb && cb()
    }
  }
}

let bookDb = new BookDb()

export default bookDb
