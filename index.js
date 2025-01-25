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
      })})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(id).then(
        person => {
    // return 404 if note is not found
    if (person) {
        response.json(person)
    } else {
        console.log(error)
        response.status(404).end()
    }        
    }
    ).catch(error => {
        console.log(error)
        response.status(404).end()
    })
})



app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

   t = Person.findByIdAndDelete(id).then(
    (result ) => response.json(result)
    ).catch(error => {
        console.log(error)
        response.status(404).end() 
    })
        console.log(t)

})


app.post('/api/persons', (request, response) => {
    const body = request.body

    // if content is missing, return 400
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const person =  new Person({ name: body.name, number: body.number })

    person.save().then(savedPerson => {
    response.json(savedPerson)
    })
})

app.get('/info', (request, response) => {
    response.send('<p>Phonebook has info for ' + persons.length + ' people</p>' + new Date())
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})