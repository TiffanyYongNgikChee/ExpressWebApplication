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
            <p><a href="/students/add">Add Student</a></p>
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
            // Build the Grades table
            let gradesTable = `
                <h1>Grades</h1>
                <p><a href="/">Home</a></p>
                <table border="1">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Module Name</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(row => {
                const studentName = row.studentName || 'Unknown Student';
                const moduleName = row.moduleName ||  '';
                const grade = row.grade || ' ';

                gradesTable += `
                    <tr>
                        <td>${studentName}</td>
                        <td>${moduleName}</td>
                        <td>${grade}</td>
                    </tr>
                `;
            });

            gradesTable += `
                    </tbody>
                </table>
                <p><a href="/">Back to Home</a></p>
            `;

            res.send(gradesTable);
        })
        .catch((error) => {
            res.send(`<p>Error: ${error.message}</p><p><a href="/">Back to Home</a></p>`);
        });
});

app.get('/lecturers', (req, res) => {
    mongoDAO.findAll()
    
        .then((lecturers) => {
            console.log(lecturers);
            // Sort lecturers by their _id field (lecturer ID)
            lecturers.sort((a, b) => (a._id > b._id ? 1 : -1));

            let lecturersTable = `
                <h1>Lecturers</h1>
                <p><a href="/">Home</a></p>
                <table border="1">
                    <thead>
                        <tr>
                            <th>Lecturer ID</th>
                            <th>Name</th>
                            <th>Modules</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            lecturers.forEach(lecturer => {
                lecturersTable += `
                    <tr>
                        <td>${lecturer._id}</td>
                        <td>${lecturer.name}</td>
                        <td>${lecturer.did}</td>
                        <td><a href="/lecturers/delete/${lecturer._id}">Delete</a></td>
                    </tr>
                `;
            });

            lecturersTable += `
                    </tbody>
                </table>
                <p><a href="/">Back to Home</a></p>
            `;

            res.send(lecturersTable);
        })
        .catch((error) => {
            res.send(`<p>Error: ${error.message}</p><p><a href="/">Back to Home</a></p>`);
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

// GET /students/add - Display Add Student Form
app.get('/students/add', (req, res) => {
    res.send(`
        <h1>Add Student</h1>
        <form method="POST" action="/students/add">
            <label>Student ID (4 characters):</label>
            <input type="text" name="sid" required minlength="4" maxlength="4"><br><br>
            <label>Name:</label>
            <input type="text" name="name" required minlength="2"><br><br>
            <label>Age:</label>
            <input type="number" name="age" required min="18"><br><br>
            <button type="submit">Add</button>
        </form>
        <p><a href="/students">Back to Students</a></p>
    `);
});

// POST /students/add - Handle Add Student Form Submission
app.post('/students/add', (req, res) => {
    const { sid, name, age } = req.body;

    // Input validation
    const errors = [];
    if (sid.length !== 4) {
        errors.push("Student ID must be exactly 4 characters.");
    }
    if (name.length < 2) {
        errors.push("Name must be at least 2 characters long.");
    }
    if (parseInt(age) < 18) {
        errors.push("Age must be 18 or older.");
    }

    if (errors.length > 0) {
        res.send(`
            <h1>Add Student</h1>
            <form method="POST" action="/students/add">
                <label>Student ID (4 characters):</label>
                <input type="text" name="sid" value="${sid}" required minlength="4" maxlength="4"><br><br>
                <label>Name:</label>
                <input type="text" name="name" value="${name}" required minlength="2"><br><br>
                <label>Age:</label>
                <input type="number" name="age" value="${age}" required min="18"><br><br>
                <button type="submit">Add</button>
            </form>
            <p style="color:red;">${errors.join('<br>')}</p>
            <p><a href="/students">Back to Students</a></p>
        `);
        return;
    }

    // Check if student ID already exists
    mysqlDAO.getStudents()
        .then((students) => {
            if (students.find(s => s.sid === sid)) {
                res.send(`
                    <h1>Add Student</h1>
                    <form method="POST" action="/students/add">
                        <label>Student ID (4 characters):</label>
                        <input type="text" name="sid" value="${sid}" required minlength="4" maxlength="4"><br><br>
                        <label>Name:</label>
                        <input type="text" name="name" value="${name}" required minlength="2"><br><br>
                        <label>Age:</label>
                        <input type="number" name="age" value="${age}" required min="18"><br><br>
                        <button type="submit">Add</button>
                    </form>
                    <p style="color:red;">Student ID already exists. Please use a unique ID.</p>
                    <p><a href="/students">Back to Students</a></p>
                `);
                return;
            }

            // Add new student to the database
            mysqlDAO.addStudent(sid, name, age)
                .then(() => {
                    res.redirect('/students');
                })
                .catch((error) => {
                    res.send(`<p>Error: ${error}</p><p><a href="/students">Back to Students</a></p>`);
                });
        })
        .catch((error) => {
            res.send(`<p>Error: ${error}</p><p><a href="/students">Back to Students</a></p>`);
        });
});

// Route to delete a lecturer by ID
app.get('/lecturers/delete/:lid', (req, res) => {
    const lid = req.params.lid;

    // Check if the lecturer is teaching any modules
    mongoDAO.isTeaching(lid)
        .then((isTeaching) => {
            if (isTeaching) {
                // If the lecturer is teaching, show an error
                res.send(`
                    <p><a href="/">Home</a></p>
                    <h1>Error Message</h1>
                    <h2>Cannot delete lecturer ${lid}. He/She has associated modules </h2>
                `);
            } else {
                // If the lecturer is not teaching, delete them
                mongoDAO.deleteLecturer(lid)
                    .then(() => {
                        res.redirect('/lecturers'); // Redirect back to the lecturers page
                    })
                    .catch((error) => {
                        res.send(`<p>Error: ${error.message}</p><p><a href="/lecturers">Back to Lecturers</a></p>`);
                    });
            }
        })
        .catch((error) => {
            res.send(`<p>Error: ${error.message}</p><p><a href="/lecturers">Back to Lecturers</a></p>`);
        });
});