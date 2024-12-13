var express = require('express')
var mysqlDAO = require('./mySqlDao')
var app = express();

app.listen(3004, () => {
    console.log("Server is listening")
})

app.get('/', (req, res) => {
    res.send("<h1>G00425067</h1>")
})
       
app.get('/students', (req, res) => {
    mysqlDAO.getStudents()
    .then((data) => {
        res.send(data)
    })
    .catch((error) => {
        res.send(error)
    })
})
        