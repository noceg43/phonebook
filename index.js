// do not use ES module it's not suggested in this course
const express = require('express')

const fs = require('fs')

const filename = './persons.json'

const persons = require(filename)

const morgan = require('morgan')

const app = express()

// activate json parser
app.use(express.json())

// set the token 'body' to return the body of the request
morgan.token('body', function getBody(req) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :total-time[4] ms :body'))


// routes

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(note => note.id === id)

    // return 404 if note is not found
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})


const updatePersons = (newContent) => fs.writeFileSync(filename, JSON.stringify(newContent))

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(note => note.id === id)

    // return 404 if note is not found
    if (person) {
        newContent = persons.filter(person => person.id !== id)
        updatePersons(newContent)
        response.json(person)
    } else {
        response.status(404).end()
    }
})

const generateId = () => {
    return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    // if content is missing, return 400
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    if (persons.find(person => body.name == person.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    updatePersons(persons.concat(person))

    response.json(person)
})

app.get('/info', (request, response) => {
    response.send('<p>Phonebook has info for ' + persons.length + ' people</p>' + new Date())
})


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})