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
} = require('./src/routes/users');
const { validateRegistration } = require('./src/validation/registerUser');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/boardgames', getBoardGames);
app.get('/boardgames/:id', getBoardGame);
app.post(
  '/boardgames',
  authenticateAdmin,
  validationBoardGame,
  upload.single('cover'),
  createBoardGame,
);
app.put(
  '/boardgames/:id',
  authenticateAdmin,
  upload.single('cover'),
  updateBoardGame,
);
app.delete('/boardgames/:id', authenticateAdmin, deleteBoardGame);

app.post('/boardgames/borrow', authenticateToken, borrowBoardGame);
app.post('/boardgames/return', authenticateToken, returnBoardGame);
app.post('/boardgames/bulk-import', authenticateAdmin, importBoardGames);

app.get(
  '/rentalByBoardgameId/:boardGameId',
  authenticateToken,
  getRentalByBoardGameId,
);
app.post('/rentals/:id/review', authenticateToken, addBoardGameReview);
app.get(
  '/rentals/:gameId',
  authenticateToken,
  getRentalsByBoardGame,
);
app.delete(
  '/rentals/:gameId/clearRatings',
  authenticateAdmin,
  clearRatingsByBoardGame,
);

app.post('/register', validateRegistration, register);
app.post('/login', login);
app.get('/user', authenticateToken, getUser);
app.post('/set-admin', authenticateAdmin, setAdmin);
app.get('/users', authenticateAdmin, getUsers);
app.patch('/users/:id', authenticateAdmin, updateUserRole);
app.post('/change-password', authenticateToken, changePassword);

app.use('/uploads', express.static('uploads'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
