// backend/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs'); // پکیج هش کردن رمز را فراخوانی می‌کنیم

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ خطا در اتصال به دیتابیس:', err.message);
  } else {
    console.log('✅ اتصال موفق به دیتابیس SQLite');
  }
});

/* ------------------------------------------------------------------ */
/* ایجاد و آماده‌سازی جداول                                            */
/* ------------------------------------------------------------------ */
db.serialize(() => {
  // این دستور برای محیط توسعه، جدول کاربران را حذف و دوباره ایجاد می‌کند
  db.run(`DROP TABLE IF EXISTS users`);

  // --- ایجاد جدول کاربران با ساختار صحیح ---
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      fullName    TEXT NOT NULL,
      username    TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL, -- e.g., 'admin', 'user'
      isActive    BOOLEAN NOT NULL DEFAULT 1,
      createdAt   TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('❌ خطا در ایجاد جدول کاربران:', err.message);
      return;
    }
    
    // --- ★★★ بخش کلیدی: ساخت کاربر مدیر پیش‌فرض ★★★ ---
    // بعد از اینکه جدول با موفقیت ساخته شد، کاربر مدیر را اضافه می‌کنیم
    
    const adminUsername = 'admin';
    const adminPassword = 'admin'; // رمز عبور ساده که می‌خواهیم هش شود
    
    // ۱. هش کردن رمز عبور
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(adminPassword, salt);
    
    // ۲. آماده‌سازی کوئری برای درج کاربر مدیر
    const insertAdminSql = `
      INSERT INTO users (id, fullName, username, password, role, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const adminData = [
      'user_' + Date.now(), // یک آیدی منحصر به فرد
      'مدیر سیستم',
      adminUsername,
      hashedPassword, // رمز عبور هش‌شده
      'admin',        // نقش مدیر
      1,              // فعال
      new Date().toISOString()
    ];
    
    // ۳. اجرای کوئری
    db.run(insertAdminSql, adminData, (err) => {
      if (err) {
        console.error('❌ خطا در ساخت کاربر مدیر پیش‌فرض:', err.message);
      } else {
        console.log(`✅ کاربر مدیر پیش‌فرض با نام کاربری '${adminUsername}' و رمز عبور '${adminPassword}' ایجاد شد.`);
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* سایر جداول پروژه شما (بدون تغییر)                                  */
  /* ------------------------------------------------------------------ */

  // جدول اعلان‌ها
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      isRead BOOLEAN NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  // جدول اصلی کارمندان
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id              TEXT PRIMARY KEY,
      fullName        TEXT,
      nationalId      TEXT,
      jobTitle        TEXT,
      department      TEXT,
      branch          TEXT,
      contactNumber   TEXT,
      email           TEXT,
      gender          TEXT,
      militaryStatus  TEXT,
      monthlySalary   INTEGER,
      status          TEXT,
      dateJoined      TEXT,
      dateOfBirth     TEXT,
      photo           TEXT,
      additionalNotes TEXT
    )
  `);

  // جدول مدارک کارمندان
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id           TEXT PRIMARY KEY,
      employeeId   TEXT NOT NULL,
      fileName     TEXT NOT NULL,
      filePath     TEXT NOT NULL,
      fileType     TEXT,
      uploadDate   TEXT NOT NULL,
      FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // جدول تسک‌ها
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id            TEXT PRIMARY KEY,
      employeeName  TEXT,
      description   TEXT,
      assignedDate  TEXT,
      dueDate       TEXT,
      status        TEXT,
      priority      TEXT,
      department    TEXT,
      completedDate TEXT
    )
  `);

  // جدول درخواست‌ها
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id             TEXT PRIMARY KEY,
      employeeName   TEXT,
      employeeId     TEXT,
      requestType    TEXT,
      status         TEXT,
      priority       TEXT,
      submissionDate TEXT,
      startDate      TEXT,
      endDate        TEXT,
      amount         INTEGER,
      description    TEXT,
      reason         TEXT,
      attachments    TEXT,
      comments       TEXT,
      history        TEXT
    )
  `);

  // جداول شعب، سمت‌ها و بخش‌ها
  db.run(`
    CREATE TABLE IF NOT EXISTS branches (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL UNIQUE,
      managerId TEXT,
      FOREIGN KEY (managerId) REFERENCES employees(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS positions (
      id    TEXT PRIMARY KEY,
      title TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS departments (
      id   TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `);
});

module.exports = db;