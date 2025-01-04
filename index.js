// do not use ES module it's not suggested in this course
const express = require('express')

const persons = require('./persons.json');

const app = express()

// activate json parser
app.use(express.json())

// routes

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})