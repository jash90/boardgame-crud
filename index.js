// index.js
const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex')(require('./knexfile').development);
const upload = require('./middleware/upload');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const cors = require('cors');
const {getRentalsByBoardGame, clearRatingsByBoardGame, addBoardGameReview, getRentalByBoardGameId} = require("./routes/rentals");
const {importBoardGames, deleteBoardGame, returnBoardGame, borrowBoardGame, updateBoardGame, getBoardGame,
    getBoardGames, createBoardGame
} = require("./routes/boardGame");
const {validationBoardGame} = require("./validation/boardgame");
const {authenticateToken, register, login, getUser, setAdmin, getUsers, updateUserRole} = require("./routes/users");
const {validateRegistration} = require("./validation/registerUser");


const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/boardgames', authenticateToken, validationBoardGame, upload.single('image'),createBoardGame);
app.get("/boardgames",getBoardGames);
app.get('/boardgames/:id', getBoardGame);
app.put('/boardgames/:id', authenticateToken,validationBoardGame, upload.single('image'), updateBoardGame);
app.delete('/boardgames/:id', authenticateToken,deleteBoardGame);
app.post('/boardgames/borrow', authenticateToken,borrowBoardGame);
app.post('/boardgames/return', authenticateToken,returnBoardGame);
app.post("/boardgames/bulk-import", authenticateToken,importBoardGames);

app.get("/rentalByBoardgameId/:boardGameId", authenticateToken,getRentalByBoardGameId);
app.post('/rentals/:id/review', authenticateToken,addBoardGameReview);
app.get('/rentals/:gameId', authenticateToken,getRentalsByBoardGame);
app.delete('/rentals/:gameId/clearRatings', authenticateToken,clearRatingsByBoardGame);

app.post('/register', validateRegistration, register);
app.post('/login', login)
app.get("/user", getUser)
app.post('/set-admin', setAdmin)
app.get("/users", getUsers)
app.patch("/users/:id",updateUserRole)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
