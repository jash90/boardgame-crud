const knex = require('knex')(require('../knexfile').development);
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register =  async (req, res) => {
    try {
        const {email, password} = req.body;

        const passwordHash = await bcrypt.hash(password, 10); // Hash the password

        const user = await knex('users').insert({
            email,
            password: passwordHash,
            role: 'mod'
        });

        res.status(201).json({ message: 'User created successfully', user });
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Error in creating user' });
    }
};

const login =  async (req, res) => {
    const { email, password } = req.body;

    // Get user from database
    const user = await knex('users').where('email', email).first();

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create JWT
    const token = jwt.sign({ id: user.id }, 'your_jwt_secret');

    res.json({ token });
};


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}


const getUser = async (req, res) => {
    try {
    // get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }


        // verify token and get user id
        const { id } = jwt.verify(token, 'your_jwt_secret');

        // fetch user from database
        const users = await knex('users').where({ id });

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // don't send password to client
        delete user.password;

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const setAdmin =  async (req, res) => {
    const { userId } = req.body;

    try {
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        const decodedToken = jwt.verify(token, 'your_jwt_secret');
        const user = await knex('users').where({ id: decodedToken.id }).first();

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can set a user as admin' });
        }

        await knex('users')
            .where({ id: userId })
            .update({ role: 'admin' });

        res.json({ message: `User with id: ${userId} has been set as admin` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in setting user as admin' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await knex('users').select('id', 'firstName', 'lastName', 'role');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error });
    }
};

const updateUserRole = async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;

    try {
        await knex('users').where('id', id).update({ role });
        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ error });
    }
};


module.exports = {login, register, authenticateToken, getUser, setAdmin, getUsers, updateUserRole}

