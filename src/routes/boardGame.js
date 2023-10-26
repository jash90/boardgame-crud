const knex = require('../../knex');

const createBoardGame = async (req, res) => {
  try {
    const { name, description, category, min_players, max_players, barcode } =
      req.body;
    let cover = req.file ? req.file.path : null;
    const newBoardGame = {
      name,
      description,
      category,
      min_players,
      max_players,
      cover,
      barcode,
    };
    await knex('boardgames').insert(newBoardGame);
    res.status(201).send('Board game created');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error creating board game');
  }
};

const getBoardGames = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const sortBy = req.query.sortBy || 'name';
    const order = req.query.order || 'asc';
    const search = req.query.search || null;
    const minPlayers = req.query.minPlayers
      ? parseInt(req.query.minPlayers)
      : null;
    const maxPlayers = req.query.maxPlayers
      ? parseInt(req.query.maxPlayers)
      : null;
    const avgRating = req.query.avgRating
      ? parseFloat(req.query.avgRating)
      : null;

    const avgRatingsSubquery = knex('rentals')
      .select('boardgame_id')
      .avg('rating as avg_rating')
      .groupBy('boardgame_id')
      .as('avg_ratings');

    const query = knex('boardgames')
      .select(
        'boardgames.id',
        'boardgames.name',
        'boardgames.category',
        'boardgames.min_players',
        'boardgames.max_players',
        'boardgames.description',
        'boardgames.is_available',
        'boardgames.cover',
        'boardgames.barcode',
        'rentals.first_name',
        'rentals.last_name',
        'rentals.rental_start_date',
        'avg_ratings.avg_rating',
      )
      .leftJoin('rentals', function () {
        this.on('boardgames.id', '=', 'rentals.boardgame_id').andOnNull(
          'rentals.rental_end_date',
        );
      })
      .leftJoin(avgRatingsSubquery, 'boardgames.id', 'avg_ratings.boardgame_id')
      .orderBy(sortBy, order)
      .limit(limit)
      .offset(offset);

    if (search) {
      query.andWhere((builder) => {
        builder
          .orWhere('boardgames.category', 'like', `%${search}%`)
          .orWhere('boardgames.name', 'like', `%${search}%`)
          .orWhere('boardgames.barcode', 'like', `%${search}%`);
      });
    }

    if (minPlayers !== null) {
      query.where('boardgames.min_players', '>=', minPlayers);
    }

    if (maxPlayers !== null) {
      query.where('boardgames.max_players', '<=', maxPlayers);
    }

    if (avgRating !== null) {
      query.where('avg_ratings.avg_rating', '>=', avgRating);
    }

    const boardgames = await query;

    res.status(200).json(boardgames);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching boardgames');
  }
};

const getBoardGame = async (req, res) => {
  try {
    const boardgame = await knex('boardgames')
      .where('id', req.params.id)
      .select(
        'id',
        'name',
        'description',
        'category',
        'min_players',
        'max_players',
        'cover',
      )
      .first();
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
    const { name, description, category, min_players, max_players, barcode } =
      req.body;
    let cover = req.file ? `uploads/${req.file.filename}` : null;
    const updatedBoardGame = {
      name,
      description,
      category,
      min_players,
      max_players,
      cover,
      barcode,
    };
    await knex('boardgames')
      .where('id', req.params.id)
      .update(updatedBoardGame);
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
  const { boardgame_id, first_name, last_name, document_number } = req.body;

  try {
    await knex.transaction(async (trx) => {
      await trx('rentals').insert({
        boardgame_id,
        first_name,
        last_name,
        document_number,
        rental_start_date: new Date(),
      });

      await trx('boardgames').where('id', boardgame_id).update({
        is_available: false,
      });
    });

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error borrowing board game');
  }
};

const returnBoardGame = async (req, res) => {
  const { boardGameId } = req.body;

  try {
    await knex.transaction(async (trx) => {
      const rental = await trx('rentals')
        .where('boardgame_id', boardGameId)
        .andWhere('rental_end_date', null)
        .first();

      if (!rental) {
        return res.status(404).json({ message: 'Rental not found.' });
      }

      // Ustawienie gry planszowej jako dostępnej
      await trx('boardgames')
        .where('id', rental.boardgame_id)
        .update({ is_available: true });

      // Aktualizacja wpisu wypożyczenia z datą zakończenia
      const updatedRental = await trx('rentals')
        .where('id', rental.id)
        .update({
          rental_end_date: new Date(),
        })
        .returning('*');

      res.status(200).json(updatedRental[0]);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while processing your request.' });
  }
};

const importBoardGames = async (req, res) => {
  try {
    const boardgames = req.body.boardgames;

    await knex('boardgames').insert(boardgames);

    res.status(200).send('Board games imported successfully');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error importing board games');
  }
};

module.exports = {
  createBoardGame,
  getBoardGames,
  getBoardGame,
  updateBoardGame,
  borrowBoardGame,
  returnBoardGame,
  deleteBoardGame,
  importBoardGames,
};
