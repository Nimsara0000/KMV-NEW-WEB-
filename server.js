const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static('public'));

app.use(session({
    secret: 'kmv_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Multer for photo upload
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ===== Admin Login =====
app.get('/login', (req, res) => res.sendFile(__dirname + '/views/login.html'));

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if(email === 'dileepasadaru5@gmail.com' && password === 'Admin@123') {
        req.session.user = email;
        res.redirect('/admin');
    } else {
        res.send('Invalid credentials');
    }
});

// ===== Admin Panel =====
app.get('/admin', (req, res) => {
    if(!req.session.user) return res.redirect('/login');
    res.sendFile(__dirname + '/views/admin.html');
});

app.post('/add-student', upload.single('photo'), (req, res) => {
    if(!req.session.user) return res.status(401).send('Unauthorized');
    const { full_name, phone, father_name, mother_name, grade } = req.body;
    const photo_path = req.file ? '/uploads/' + req.file.filename : '';
    db.query('INSERT INTO students SET ?', { full_name, phone, father_name, mother_name, grade, photo_path }, (err) => {
        if(err) throw err;
        res.redirect('/admin');
    });
});

// ===== Public Page =====
app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'));

app.get('/students', (req, res) => {
    db.query('SELECT * FROM students ORDER BY grade, full_name', (err, results) => {
        if(err) throw err;
        res.json(results);
    });
});

// ===== Logout =====
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
