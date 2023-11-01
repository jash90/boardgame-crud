const knex = require('../../knex')

const getRentalByBoardGameId = async (req, res) => {
  const { boardGameId } = req.params

  try {
    const rental = await knex('rentals')
      .where('boardgame_id', boardGameId)
      .andWhere('rental_end_date', null)
      .first()

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found.' })
    }

    res.json(rental)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: 'An error occurred while fetching the rental.' })
  }
}

const addBoardGameReview = async (req, res) => {
  const { id } = req.params
  const { rating, review } = req.body

  try {
    await knex('rentals').where({ id }).update({ rating, review })

    res.status(200).send('Review added successfully')
  } catch (error) {
    res.status(500).send('Error adding review')
  }
}

const getRentalsByBoardGame = async (req, res) => {
  try {
    const { gameId } = req.params
    const rentals = await knex('rentals')
      .join('boardgames', 'rentals.boardgame_id', '=', 'boardgames.id')
      .select('rentals.*', 'boardgames.name as game_name')
      .where('rentals.boardgame_id', gameId)

    const boardGame = await knex('boardgames')
      .where('id', req.params.gameId)
      .first()

    if (!boardGame) {
      res.status(404).send('Board game not found')
    }

    // if (rentals.length === 0) {
    //   return res.status(404).send(`No rentals found for game id ${gameId}`);
    // }

    res.status(200).json({ boardGameName: boardGame.name, rentals })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error fetching rentals')
  }
}

const clearRatingsByBoardGame = async (req, res) => {
  const { gameId } = req.params
  try {
    await knex('rentals').where('boardgame_id', gameId).delete()
    res.status(200).send('Ratings cleared successfully')
  } catch (error) {
    res.status(500).send('Error clearing ratings')
  }
}

module.exports = {
  getRentalByBoardGameId,
  getRentalsByBoardGame,
  addBoardGameReview,
  clearRatingsByBoardGame
}
