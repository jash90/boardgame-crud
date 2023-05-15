const knex = require('knex')(require('./../knexfile').development);

const createBoardGame = async (req, res) => {
    try {
        const {name, description, category, min_players, max_players} = req.body;
        const newBoardGame = {name, description, category, min_players, max_players};
        await knex('boardgames').insert(newBoardGame);
        res.status(201).send('Board game created');
    } catch (error) {
        console.log(error)
        res.status(500).send('Error creating board game');
    }
};

const getBoardGames = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const sortBy = req.query.sortBy || 'name';
        const order = req.query.order || 'asc';
        const search = req.query.search || '';
        const category = req.query.category || '';

        const avgRatingsSubquery = knex('rentals')
            .select('boardgame_id')
            .avg('rating as avg_rating')
            .groupBy('boardgame_id')
            .as('avg_ratings');

        const boardgames = await knex('boardgames')
            .select(
                'boardgames.id',
                'boardgames.name',
                'boardgames.category',
                'boardgames.min_players',
                'boardgames.max_players',
                'boardgames.description',
                'boardgames.is_available',
                'rentals.first_name',
                'rentals.last_name',
                'rentals.rental_start_date',
                'avg_ratings.avg_rating'
            )
            .leftJoin('rentals', function () {
                this.on('boardgames.id', '=', 'rentals.boardgame_id').andOnNull(
                    'rentals.rental_end_date'
                );
            })
            .leftJoin(avgRatingsSubquery, 'boardgames.id', 'avg_ratings.boardgame_id')
            .where('boardgames.name', 'like', `%${search}%`)
            .andWhere((builder) => {
                if (category) {
                    builder.where('boardgames.category', category);
                }
            })
            .orderBy(sortBy, order)
            .limit(limit)
            .offset(offset);

        res.status(200).json(boardgames);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching boardgames');
    }
};



const getBoardGame = async (req, res) => {
    try {
        const boardgame = await knex('boardgames').where('id', req.params.id).first();
        if (boardgame) {
            res.status(200).json(boardgame);
        } else {
            res.status(404).send('Board game not found');
        }
    } catch (error) {
        res.status(500).send('Error fetching board game');
    }
};

const updateBoardGame = async (req, res) => {
    try {
        const {name, description, category, min_players, max_players} = req.body;
        const updatedBoardGame = {name, description, category, min_players, max_players};
        await knex('boardgames').where('id', req.params.id).update(updatedBoardGame);
        res.status(200).send('Board game updated');
    } catch (error) {
        res.status(500).send('Error updating board game');
    }
};

const deleteBoardGame = async (req, res) => {
    try {
        await knex('boardgames').where('id', req.params.id).del();
        res.status(200).send('Board game deleted');
    } catch (error) {
        res.status(500).send('Error deleting board game');
    }
};

const borrowBoardGame = async (req, res) => {
    const {boardgame_id, first_name, last_name, document_number} = req.body;

    try {
        await knex('rentals').insert({
            boardgame_id,
            first_name,
            last_name,
            document_number,
            rental_start_date: new Date(),
        });

        await knex('boardgames')
            .where('id', boardgame_id)
            .update({
                is_available: false,
            });

        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error borrowing board game');
    }
};


const returnBoardGame = async (req, res) => {
    const {rental_id} = req.body;

    try {
        // Find the corresponding rental entry
        const rental = await knex('rentals').where('id', rental_id).first();
        if (!rental) {
            return res.status(404).json({message: 'Rental not found.'});
        }

        // Set the board game as available
        await knex('boardgames').where('id', rental.boardgame_id).update({is_available: true});

        // Update the rental entry with the end date
        const updatedRental = await knex('rentals').where('id', rental_id).update({
            rental_end_date: new Date(),
        }).returning('*');

        res.status(200).json(updatedRental[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'An error occurred while processing your request.'});
    }
}

const importBoardGames = async (req, res) => {
    try {
        const boardgames = req.body.boardgames;

        await knex("boardgames").insert(boardgames);

        res.status(200).send("Board games imported successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error importing board games");
    }
}

module.exports = {
    createBoardGame,getBoardGames,getBoardGame, updateBoardGame, borrowBoardGame, returnBoardGame, deleteBoardGame, importBoardGames
}

