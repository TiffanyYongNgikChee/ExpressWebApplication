var express = require('express')
var mysqlDAO = require('./mySqlDao')
var mongoDAO = require('./mongoDAO')
var app = express();

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

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
                        <th>Actions</th>
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
                    <td>
                        <a href="/students/edit/${student.sid}">Update</a>
                    </td>
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

// GET /students/edit/:sid - Display Edit Form
app.get('/students/edit/:sid', (req, res) => {
    const sid = req.params.sid;

    mysqlDAO.getStudents()
        .then((students) => {
            const student = students.find(s => s.sid === sid);
            if (!student) {
                res.send(`<p>Student not found</p><p><a href="/students">Back to Students</a></p>`);
                return;
            }

            res.send(`
                <h1>Update Student</h1>
                <form method="POST" action="/students/edit/${sid}">
                    <label>Student ID: <strong>${student.sid}</strong></label><br><br>
                    <label>Name:</label>
                    <input type="text" name="name" value="${student.name}" required minlength="2"><br><br>
                    <label>Age:</label>
                    <input type="number" name="age" value="${student.age}" required min="18"><br><br>
                    <button type="submit">Update</button>
                </form>
                <p><a href="/students">Back to Students</a></p>
            `);
        })
        .catch((error) => {
            res.send(`<p>Error: ${error}</p><p><a href="/students">Back to Students</a></p>`);
        });
});

// POST /students/edit/:sid - Handle Update Form Submission
app.post('/students/edit/:sid', (req, res) => {
    const sid = req.params.sid;
    const { name, age } = req.body;

    // Input validation
    const errors = [];
    if (name.length < 2) {
        errors.push("Name must be at least 2 characters long.");
    }
    if (parseInt(age) < 18) {
        errors.push("Age must be 18 or older.");
    }

    if (errors.length > 0) {
        res.send(`
            <h1>Edit Student</h1>
            <form method="POST" action="/students/edit/${sid}">
                <label>Student ID: <strong>${sid}</strong></label><br><br>
                <label>Name:</label>
                <input type="text" name="name" value="${name}" required minlength="2"><br><br>
                <label>Age:</label>
                <input type="number" name="age" value="${age}" required min="18"><br><br>
                <button type="submit">Update</button>
            </form>
            <p style="color:red;">${errors.join('<br>')}</p>
            <p><a href="/students">Back to Students</a></p>
        `);
        return;
    }

    // Update student using mysqlDAO
    mysqlDAO.updateStudent(sid, name, age)
        .then(() => {
            res.redirect('/students');
        })
        .catch((error) => {
            res.send(`<p>Error: ${error}</p><p><a href="/students">Back to Students</a></p>`);
        });
});