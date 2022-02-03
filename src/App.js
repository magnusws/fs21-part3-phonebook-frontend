import React, { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/personService'
import Notification from './components/Notification'

const App = () => {

  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handlePhoneNumberChange = (event) => {
    setNewPhoneNumber(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
  }

  const addPerson = (event) => {  // add a new person
    event.preventDefault()

    const doesAlreadyExist = persons         // checks if person already exist
      .map(person => person.name.toLowerCase())
      .includes(newName.toLowerCase())

    if (!doesAlreadyExist) {            // if a person does not already exist

      const personObject = {            // new person obj
        name: newName,
        number: newPhoneNumber,
      }

      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewPhoneNumber('')
          setNotification(`${returnedPerson.name} was added to the phonebook!`)
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
        .catch(error => {
          setError(true)
          setNotification(`${error.response.data.error}`)
          setTimeout(() => {
            setNotification(null)
            setError(false)
          }, 5000)
        })

    } else {
      updatePerson()
    }
  }

  const updatePerson = () => {
    if (window.confirm(`${newName} is already added to phonebook, replace old number with a new one?`)) {
      const currentPerson = persons.find(p => p.name === newName)

      const newPerson = {   // new person obj
        name: currentPerson.name,
        number: newPhoneNumber,
      }

      personService
        .update(currentPerson.id, newPerson)
        .then(returnedPerson => {
          console.log(returnedPerson)
          // replaces old object with updated object
          setPersons(persons.map(person => person.id === currentPerson.id
            ? returnedPerson
            : person
          ))
          setNotification(`${returnedPerson.name}'s phonenumber was updated!`)
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
        .catch(error => {
          setError(true)
          setNotification(`${error.response.data.error}`)
          setTimeout(() => {
            setNotification(null)
            setError(false)
          }, 5000)
        })
    }
  }


  const removePerson = (event) => {
    const id = event.target.value
    const personObj = persons.find(person => person.id === id)

    if (window.confirm(`Are you sure you want to delete ${personObj.name}?`)) {
      personService
        .remove(id)
        .then(setPersons(persons.filter(p => p.id !== id)))
        .catch(error => {
          setNotification(`${error.response.data}`)
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} isError={error} />
      <Filter onChange={handleSearchChange} value={search} />
      <h2>Add a new</h2>
      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newPhoneNumber={newPhoneNumber}
        handlePhoneNumberChange={handlePhoneNumberChange}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} search={search} onClick={removePerson} />
    </div>
  )
}

export default App