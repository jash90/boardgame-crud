// index.js
const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex')(require('./knexfile').development);
const upload = require('./middleware/upload');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const cors = require('cors');
require('dotenv').config();
const {
    getRentalsByBoardGame,
    clearRatingsByBoardGame,
    addBoardGameReview,
    getRentalByBoardGameId
} = require("./routes/rentals");
const {
    importBoardGames, deleteBoardGame, returnBoardGame, borrowBoardGame, updateBoardGame, getBoardGame,
    getBoardGames, createBoardGame
} = require("./routes/boardGame");
const {validationBoardGame} = require("./validation/boardgame");
const {
    authenticateToken,
    register,
    login,
    getUser,
    setAdmin,
    getUsers,
    updateUserRole,
    authenticateAdmin
} = require("./routes/users");
const {validateRegistration} = require("./validation/registerUser");


const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/boardgames", authenticateToken, getBoardGames);
app.get('/boardgames/:id', authenticateToken, getBoardGame);
app.post('/boardgames', authenticateAdmin, validationBoardGame, upload.single('image'), createBoardGame);
app.put('/boardgames/:id', authenticateAdmin, validationBoardGame, upload.single('image'), updateBoardGame);
app.delete('/boardgames/:id', authenticateAdmin, deleteBoardGame);
app.post('/boardgames/borrow', authenticateToken, borrowBoardGame);
app.post('/boardgames/return', authenticateToken, returnBoardGame);
app.post("/boardgames/bulk-import", authenticateAdmin, importBoardGames);

app.get("/rentalByBoardgameId/:boardGameId", authenticateToken, getRentalByBoardGameId);
app.post('/rentals/:id/review', authenticateToken, addBoardGameReview);
app.get('/rentals/:gameId', authenticateToken, getRentalsByBoardGame);
app.delete('/rentals/:gameId/clearRatings', authenticateAdmin, clearRatingsByBoardGame);

app.post('/register', validateRegistration, register);
app.post('/login', login)
app.get("/user", authenticateToken, getUser)
app.post('/set-admin', authenticateAdmin, setAdmin)
app.get("/users", authenticateAdmin, getUsers)
app.patch("/users/:id", authenticateAdmin, updateUserRole)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
