const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const personToAdd = process.argv[3]
const personNumber = process.argv[4]
console.log("persontoadd then personnumber",personToAdd, personNumber)
const url = `mongodb+srv://kopelthep:${password}@cluster0.pditrmn.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`
            
function useRegex(input) {
    let regex = /^[+]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?)(?:[ -]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?))*(?:[ ]?(?:x|ext)\.?[ ]?\d{1,5})?$/i;
    return regex.test(input);
}// generated using https://regex-generator.olafneumann.org/?sampleText=541-123%206532&flags=Wi&selection=0%7CUS%20phone%20number
mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String,
})



const Person = mongoose.model('Person', phonebookSchema)

console.log("process argv length",process.argv.length)
if (process.argv.length == 3) {
    console.log('Printing all notes')
    Person.find({}).then(result => { //print all notes
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
    
}
else{
    if (process.argv.length !== 5) {
        console.log("Error, you added an invalid number of arguments,exiting")
        mongoose.connection.close()
        process.exit(1)
    }
    else{
        if (!(useRegex(personNumber))){
            console.log("Added number is INVALID, exiting")
            mongoose.connection.close()
            process.exit(1)
        }
        console.log("length",process.argv.length)
        const person = new Person(
            {
                name: personToAdd,
                number: personNumber,
            }
        )

        person.save().then(result => {
            console.log('person added and saved!')
            mongoose.connection.close()
            }
        )
    }
}



// Person.find({}).then(result => { //print all notes
//   result.forEach(person => {
//     console.log(person)
//   })
//   mongoose.connection.close()
// })

// Person.find({ important: true }).then(result => { //print ONLY IMPORTANT NOTES
//   result.forEach(note => {
//     console.log(note)
//   })
//   mongoose.connection.close()
// })
