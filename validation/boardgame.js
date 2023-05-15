// validation/boardgame.js
const Joi = require('joi');

const boardgameSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).required(),
    category: Joi.string().optional().allow(''),
    min_players: Joi.number().integer().min(1).required(),
    max_players: Joi.number().integer().min(1).required(),
    is_available: Joi.boolean().default(true)
});

const validationBoardGame = (req, res, next) => {
    const {error} = boardgameSchema.validate(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        next();
    }
};

module.exports = {validationBoardGame}
