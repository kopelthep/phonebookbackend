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


const currentStatus = (length) => {
    const datenow = Date.now()
    const realtimestamp = Date(datenow).toString()
    //console.log(realtimestamp)
    const responseString = String ("<p> Phonebook has info on " + String(length) + " people </p>") + ("<p>"+ realtimestamp +"</p>")
    return(
        responseString
    )

}



app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
}) 

app.get("/info",(request,response,next)=>{
  Person.find({}).then((persons)=> {
    console.log("persons length", persons.length)
    response.send(currentStatus(length=persons.length))
  })
  .catch((error)=>next(error))
    
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
  .catch((error)=>next(error))
})



app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})



app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})



app.post('/api/persons', (request, response,next) => {
  const body = request.body
  console.log("REQUEST MADE")

  
  
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
  
  Person.findOne({number:body.number})
    .then((existingPerson) => {
      if (existingPerson) {
        return response.status(400).json({
          error:"Number already in use"
        })
      }
      const person = new Person({
        name: body.name,
        number: body.number,
      })
      return person.save().then((savedPerson) => {
        response.json(savedPerson)
      })
    })
    .catch((error)=>next(error))
  
})

app.put('/api/persons/:id', (request, response, next) => {
  //console.log("request body",request.body)
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch((error) => next(error))
})



const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.error("Error name:",error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error })
  }

  next(error)
}


app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})