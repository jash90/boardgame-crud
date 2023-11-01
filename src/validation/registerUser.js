const Joi = require('joi')
const express = require('express')
const app = express()

app.use(express.json())

// Define the validation schema
const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required()
})

// Create a middleware for validation
const validateRegistration = (req, res, next) => {
  const { error } = registrationSchema.validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)
  next()
}

module.exports = { validateRegistration }
