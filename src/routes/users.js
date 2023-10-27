const knex = require('../../knex');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretOrPublicKey = process.env.SECRET_OR_PUBLIC_KEY;
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

function convertToSeconds(str) {
  const timeUnits = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  // Check if the input matches the format we expect
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    throw new Error('Invalid duration format');
  }

  const amount = Number(match[1]);
  const unit = match[2];

  return amount * timeUnits[unit];
}

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10); // Hash the password

    const user = await knex('users').insert({
      email,
      password: passwordHash,
      role: 'mod',
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (e) {
    res.status(500).json({ message: 'Error in creating user' });
  }
};

const login = async (req, res) => {
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

  // Create JWT with 1 hour expiration
  const token = jwt.sign({ id: user.id }, secretOrPublicKey, {
    expiresIn: process.env.EXPIRES_TOKEN,
  });

  // Generate a refresh token with 1 day expiration
  const refreshToken = jwt.sign({ id: user.id }, secretOrPublicKey, {
    expiresIn: process.env.EXPIRES_REFRESH_TOKEN,
  });

  // Store the refresh token in redis with expiration
  await redis.set(
    user.id.toString(),
    refreshToken,
    'EX',
    convertToSeconds(process.env.EXPIRES_REFRESH_TOKEN),
  ); // 1 day in seconds

  res.json({ token, refreshToken });
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  await jwt.verify(token, secretOrPublicKey, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
};

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { id } = await jwt.verify(token, secretOrPublicKey, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
  });

  const user = await knex('users').where({ id }).first();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user?.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  next();
};

const getUser = async (req, res) => {
  try {
    // get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // verify token and get user id
    const { id } = await jwt.verify(token, secretOrPublicKey, (err, user) => {
      if (err) return res.sendStatus(401);
      req.user = user;
    });

    // fetch user from database
    const user = await knex('users').where({ id }).first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // don't send password to client
    delete user.password;

    res.json(user);
  } catch (error) {
    if (error == 'JsonWebTokenError: invalid signature') {
      res.status(498).json({ message: 'invalid signature' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

const setAdmin = async (req, res) => {
  const { userId } = req.body;

  try {
    const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const decodedToken = await jwt.verify(token, secretOrPublicKey, (err, user) => {
      if (err) return res.sendStatus(401);
      req.user = user;
    });
    const user = await knex('users').where({ id: decodedToken.id }).first();

    if (user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Only admin can set a user as admin' });
    }

    await knex('users').where({ id: userId }).update({ role: 'admin' });

    res.json({ message: `User with id: ${userId} has been set as admin` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error in setting user as admin' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await knex('users').select(
      'id',
      'email',
      'firstName',
      'lastName',
      'role',
    );
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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // verify token and get user id
    const { id } = await jwt.verify(token, secretOrPublicKey, (err, user) => {
      if (err) return res.sendStatus(401);
      req.user = user;
    });

    // fetch user from database
    const user = await knex('users').where({ id }).first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await knex('users').where({ id: user.id }).update({
      password: passwordHash,
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Error in changing password' });
  }
};

const refresh = async (req, res) => {
  const authRefreshToken = req.headers['x-refresh-token'];
  const refreshToken = authRefreshToken && authRefreshToken.split(' ')[1];

  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token is required' });
  }

  await jwt.verify(refreshToken, secretOrPublicKey, async (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Refresh token expired' });
      }
      return res.sendStatus(403);
    }

    const storedRefreshToken = await redis.get(user.id.toString());

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return res.sendStatus(403);
    }

    const newToken = jwt.sign({ id: user.id }, secretOrPublicKey, {
      expiresIn: process.env.EXPIRES_TOKEN,
    });
    const newRefreshToken = jwt.sign({ id: user.id }, secretOrPublicKey, {
      expiresIn: process.env.EXPIRES_REFRESH_TOKEN,
    });
    await redis.set(
      user.id.toString(),
      newRefreshToken,
      'EX',
      convertToSeconds(process.env.EXPIRES_REFRESH_TOKEN),
    ); // 1 day in seconds

    res.json({ token: newToken, refreshToken: newRefreshToken });
  });
};

module.exports = {
  login,
  register,
  authenticateToken,
  getUser,
  setAdmin,
  getUsers,
  updateUserRole,
  authenticateAdmin,
  changePassword,
  refresh,
};
