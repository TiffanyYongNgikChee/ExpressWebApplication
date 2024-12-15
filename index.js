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
        let table = `
            <h1>Students</h1>
            <p><a href="/">Home</a></p>
            <table border="1">
                <thead>
                    <tr>
                        <th>StudentID</th>
                        <th>Name</th>
                        <th>Age</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(student => {
            table += `
                <tr>
                    <td>${student.sid}</td>
                    <td>${student.name}</td>
                    <td>${student.age}</td>
                </tr>
            `;
        });

        table += `
                </tbody>
            </table>
            <p><a href="/">Back to Home</a></p>
        `;

        res.send(table);
    })
    .catch((error) => {
        res.send(`<p>Error: ${error}</p><p><a href="/">Back to Home</a></p>`);
    });
});

app.get('/grades', (req, res) => {
    mysqlDAO.getGrades()
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