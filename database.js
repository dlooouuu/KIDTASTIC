const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
        if (err) {
          console.error('Database connection error:', err.message);
          reject(err);
        } else {
          console.log('Connected to the SQLite database');
          
          // Create users table if it doesn't exist
          this.db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullname TEXT NOT NULL
          )`, (err) => {
            if (err) {
              console.error('Error creating users table:', err.message);
              reject(err);
            } else {
              console.log('Users table ready');
              resolve(this.db);
            }
          });
        }
      });
    });
  }

  close() {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      });
    }
    return Promise.resolve();
  }

  getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  createUser(username, password, fullname) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)',
        [username, password, fullname], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
}

module.exports = new Database();