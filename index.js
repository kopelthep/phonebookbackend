require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const app = express()
const Person = require('./models/person')


morgan.token('body', function (req, res) { return JSON.stringify(req.body) })


const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))
app.use(express.json())

let persons = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": "2",
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": "3",
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

const currentStatus = () => {
    const length = persons.length
    const datenow = Date.now()
    const realtimestamp = Date(datenow).toString()
    console.log(realtimestamp)
    const responseString = String ("<p> Phonebook has info on " + String(length) + " people </p>") + ("<p>"+ realtimestamp +"</p>")
    return(
        responseString
    )

}



app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
}) 

app.get("/info",(request,response)=>{
    response.send(currentStatus())
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get("/api/persons/:id",(request,response)=> {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } 
    else {
        response.status(404).end()
    }
})
const generateId = () => {
  const maxId = persons.length > 0
    ? Math.floor(Math.random()*100000)+1
    : 0
  return String(maxId + 1)
}

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})



app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
  if (persons.find(person => person.number === body.number)) {
    return response.status(400).json({ 
      error: 'number already exists' 
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: generateId(),
  })

  persons = persons.concat(person)


  person.save().then((savedPerson)=>{
    response.json(savedPerson)
  })
  
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})