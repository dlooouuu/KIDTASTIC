const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;
let mainWindow;

function initDatabase() {
  db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
    } else {
      console.log('Connected to the SQLite database');
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullname TEXT NOT NULL
      )`, (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
        } else {
          console.log('Users table ready');
        }
      });
    }
  });
}

function createWindow(initialPage = 'login.html') {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile(initialPage);

  // ✅ ADDED: Enable loading vosk.wasm by setting proper headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': ['same-origin'],
        'Cross-Origin-Embedder-Policy': ['require-corp'],
      }
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (initialPage === 'login.html') {
    checkRememberedUser();
  }
}

async function checkRememberedUser() {
  const rememberedUser = await session.defaultSession.cookies.get({ name: 'rememberedUser' });
  if (rememberedUser.length > 0) {
    const username = rememberedUser[0].value;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (!err && row) {
        mainWindow.webContents.send('auto-login', {
          username: row.username,
          fullname: row.fullname
        });
        mainWindow.loadFile('pagsuway.html');
      }
    });
  }
}

app.whenReady().then(() => {
  initDatabase();
  createWindow('login.html');

  ipcMain.handle('login', async (event, username, password, rememberMe) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          resolve({ status: 'error', message: 'Database error occurred' });
        } else if (!row) {
          resolve({ status: 'error', message: 'User not found' });
        } else if (row.password !== password) {
          resolve({ status: 'error', message: 'Invalid password' });
        } else {
          if (rememberMe) {
            session.defaultSession.cookies.set({
              url: 'http://localhost',
              name: 'rememberedUser',
              value: username,
              expirationDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
            });
          }
          resolve({
            status: 'success',
            message: 'Login successful!',
            userData: { fullname: row.fullname, username: row.username }
          });
        }
      });
    });
  });

  ipcMain.handle('signup', async (event, username, password, fullname) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)',
        [username, password, fullname], function(err) {
        if (err) {
          console.error('Signup error:', err.message);
          if (err.message.includes('UNIQUE constraint failed')) {
            resolve('Username already exists');
          } else {
            resolve('Registration failed: ' + err.message);
          }
        } else {
          resolve('User registered successfully!');
        }
      });
    });
  });

  ipcMain.handle('logout', async () => {
    await session.defaultSession.cookies.remove('http://localhost', 'rememberedUser');
    mainWindow.webContents.send('stop-music');
    mainWindow.loadFile('login.html');
    return 'Logged out successfully';
  });

  ipcMain.handle('closeApp', async () => {
    mainWindow.webContents.send('stop-music');
    app.quit();
  });

  ipcMain.handle('validate-password', async (event, username, password) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          console.error('Error validating password:', err.message);
          reject(err);
        } else if (!row) {
          resolve(false); // User not found
        } else if (row.password === password) {
          resolve(true); // Password matches
        } else {
          resolve(false); // Password incorrect
        }
      });
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
        app.quit();
      });
    } else {
      app.quit();
    }
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow('login.html');
  }
});
