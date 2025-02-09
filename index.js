// do not use ES module it's not suggested in this course
const express = require('express')
const cors = require('cors')
const Person = require('./models/person')

const fs = require('fs')

const filename = './persons.json'

const persons = require(filename)

const morgan = require('morgan')

const app = express()

// activate cors
app.use(cors())

// activate json parser
app.use(express.json())

// on the dist folder, we have the frontend
// when the server receives a GET request this middleware is used
app.use(express.static('frontend/dist'))

// another middleware used to log
const requestLogger = (request, response, next) => {
    // execute this before moving to the next middleware
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    // move to the next middleware
    next()
}
app.use(requestLogger)

// set the token 'body' to return the body of the request
morgan.token('body', function getBody(req) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :total-time[4] ms :body'))


// routes

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then(
        person => {
            // return 404 if note is not found
            if (person) {
                response.json(person)
            } else {
                console.log(error)
                // 404 Not Found, since the note doesn't exist
                response.status(404).end()
            }
        }
    )
        // Pass to the middleware error handler
        .catch(error => next(error))
})



app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id

    Person.findByIdAndDelete(id).then(result => {
        response.status(204).end()
    })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    Person.findOne({ name: body.name }).then(
        person => {
            // return 404 if note is not found
            if (person) {
                const newData = { name: body.name, number: body.number }
                Person.findByIdAndUpdate(
                    person._id,
                    newData,
                    { new: true, runValidators: true, context: 'query' },
                ).then(updatedPerson => {
                    response.json(updatedPerson)
                }).catch(error => next(error))

            } else {
                const person = new Person({ name: body.name, number: body.number })

                person.save().then(savedPerson => {
                    response.json(savedPerson)
                }).catch(error => next(error))
            }
        }
    )
})

app.get('/info', (request, response) => {

    Person.find({}).then(persons => {
        response.send('<p>Phonebook has info for ' + persons.length + ' people</p>' + new Date())
    })
})


// Catch-all middleware for non-existent routes (404)
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);


const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    // throwed if the error is a validation error (for the GET request with an invalid id)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})