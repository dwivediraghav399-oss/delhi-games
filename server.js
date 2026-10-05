const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = [
    { username: 'admin', password: 'admin', coins: 99999, isAdmin: true }
];
let pendingRegistrations = {};

app.post('/api/send-otp', (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) return res.json({ success: false, message: 'All fields are required!' });
    
    let existing = users.find(u => u.username === username);
    if(existing) return res.json({ success: false, message: 'Username already exists!' });

    let otp = Math.floor(1000 + Math.random() * 9000).toString();
    pendingRegistrations[username] = { password, otp };
    
    res.json({ success: true, message: `OTP sent successfully! (Mock OTP: ${otp})`, otp });
});

app.post('/api/verify-register', (req, res) => {
    const { username, otp } = req.body;
    let pending = pendingRegistrations[username];
    
    if(!pending) return res.json({ success: false, message: 'Registration session expired!' });
    if(pending.otp !== otp) return res.json({ success: false, message: 'Invalid OTP!' });

    users.push({ username, password: pending.password, coins: 5000, isAdmin: false });
    delete pendingRegistrations[username];
    
    res.json({ success: true, message: 'Registration successful and verified!' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let user = users.find(u => u.username === username && u.password === password);
    
    if(user) {
        res.json({ success: true, user: { username: user.username, coins: user.coins, isAdmin: user.isAdmin } });
    } else {
        res.json({ success: false, message: 'Invalid username or password!' });
    }
});

app.post('/api/update-coins', (req, res) => {
    const { username, amount } = req.body;
    let user = users.find(u => u.username === username);
    if(user) {
        user.coins += amount;
        if(user.coins < 0) user.coins = 0;
        res.json({ success: true, coins: user.coins });
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

app.get('/api/leaderboard', (req, res) => {
    let sorted = users.map(u => ({ username: u.username, coins: u.coins }))
                      .sort((a, b) => b.coins - a.coins);
    res.json(sorted);
});

app.get('/api/admin/users', (req, res) => {
    res.json(users);
});

app.post('/api/admin/modify-coins', (req, res) => {
    const { username, coins } = req.body;
    let user = users.find(u => u.username === username);
    if(user) {
        user.coins = Number(coins);
        res.json({ success: true, message: 'Coins updated by Admin!' });
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

app.listen(3000, () => {
    console.log('Delhi Games Server running on http://localhost:3000');
});
