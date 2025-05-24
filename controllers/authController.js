const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, role], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'User registered' });
    });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  });
};
