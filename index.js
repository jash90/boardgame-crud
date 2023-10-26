// index.js
const express = require('express');
const bodyParser = require('body-parser');
const upload = require('./src/middleware/upload');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const cors = require('cors');
const cache = require('./src/cache');

require('dotenv').config();
const {
  getRentalsByBoardGame,
  clearRatingsByBoardGame,
  addBoardGameReview,
  getRentalByBoardGameId,
} = require('./src/routes/rentals');
const {
  importBoardGames,
  deleteBoardGame,
  returnBoardGame,
  borrowBoardGame,
  updateBoardGame,
  getBoardGame,
  getBoardGames,
  createBoardGame,
} = require('./src/routes/boardGame');
const { validationBoardGame } = require('./src/validation/boardgame');
const {
  authenticateToken,
  register,
  login,
  getUser,
  setAdmin,
  getUsers,
  updateUserRole,
  authenticateAdmin,
  changePassword,
  refresh,
} = require('./src/routes/users');
const { validateRegistration } = require('./src/validation/registerUser');

const PREFIX = '/api'

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} ${res.statusCode}`);
  next();
});

app.get(PREFIX + '/boardgames', getBoardGames);
app.get(PREFIX + '/boardgames/:id', getBoardGame);
app.post(
    PREFIX + '/boardgames',
  authenticateAdmin,
  upload.single('cover'),
  validationBoardGame,
  createBoardGame,
);
app.put(
    PREFIX + '/boardgames/:id',
  authenticateAdmin,
  upload.single('cover'),
  validationBoardGame,
  updateBoardGame,
);
app.delete(PREFIX + '/boardgames/:id', authenticateAdmin, deleteBoardGame);

app.post(PREFIX + '/boardgames/borrow', authenticateToken, borrowBoardGame);
app.post(PREFIX + '/boardgames/return', authenticateToken, returnBoardGame);
app.post(PREFIX + '/boardgames/bulk-import', authenticateAdmin, importBoardGames);

app.get(
    PREFIX + '/rentalByBoardgameId/:boardGameId',
  authenticateToken,
  getRentalByBoardGameId,
);
app.post(PREFIX + '/rentals/:id/review', authenticateToken, addBoardGameReview);
app.get(PREFIX + '/rentals/:gameId', authenticateToken, getRentalsByBoardGame);
app.delete(
    PREFIX + '/rentals/:gameId/clearRatings',
  authenticateAdmin,
  clearRatingsByBoardGame,
);

app.post(PREFIX + '/register', validateRegistration, register);
app.post(PREFIX + '/login', login);
app.get(PREFIX + '/user', authenticateToken, getUser);
app.post(PREFIX + '/set-admin', authenticateAdmin, setAdmin);
app.get(PREFIX + '/users', authenticateAdmin, getUsers);
app.patch(PREFIX + '/users/:id', authenticateAdmin, updateUserRole);
app.post(PREFIX + '/change-password', authenticateToken, changePassword);
app.post(PREFIX + '/refresh', refresh);

app.use(PREFIX + '/uploads', express.static('uploads'));
app.use(PREFIX + '/assets', express.static('assets'));

app.use(PREFIX + '/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
