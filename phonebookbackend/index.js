require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

morgan.token('body', request => JSON.stringify(request.body))

app.use(morgan('tiny', {
  skip: (request, response) => request.method === 'POST'
}))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: (request, response) => request.method !== 'POST'
}))


let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  }) 
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
  /*
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
  */
})

app.get('/api/info', (request, response) => {
  const requestDate = new Date();
  response.send(`
  <div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${requestDate}</p>
  </div>`)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if(!body.name && !body.number) {
    return response.status(400).json({ 
      error: 'name and number are missing' 
    })
  } else if(!body.name) {
    return response.status(400).json({ 
      error: 'name is missing' 
    })
  } else if(!body.number) {
    return response.status(400).json({ 
      error: 'number is missing' 
    })
  }

  Person.find({name: body.name}).then(result => {
    if(result.length === 0) {  // name is unique
      const person = new Person({
        name: body.name,
        number: body.number
      })
      person.save().then(savedPerson => {
        response.json(savedPerson)
      })
    } else {  // name is not unique
      return response.status(400).json({ 
        error: 'name must be unique'
      })
    }
  })
})

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)