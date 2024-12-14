var express = require('express')
var mysqlDAO = require('./mySqlDao')
var mongoDAO = require('./mongoDAO')
var app = express();

app.listen(3004, () => {
    console.log("Server is listening")
})

app.get('/', (req, res) => {
    res.send(`
        <h1>G00425067</h1>
        <p><a href="/students">Students</a></p>
        <p><a href="grades">Grades</a></p>
        <p><a href="/lecturers">Lecturers</a></p>
        
    `);
});    
app.get('/students', (req, res) => {
    mysqlDAO.getStudents()
    .then((data) => {
        res.send(data)
    })
    .catch((error) => {
        res.send(error)
    })
})

app.get('/grades', (req, res) => {
    mysqlDAO.getStudents()
    .then((data) => {
        res.send(data)
    })
    .catch((error) => {
        res.send(error)
    })
})

// Get Lecturers from MongoDB
app.get('/lecturers', (req, res) => {
    mongoDAO.findAll()
        .then((documents) => {
            res.send(documents);
        })
        .catch((error) => {
            console.error('Error fetching lecturers:', error.message);
            res.status(500).send(error.message);
        });
});