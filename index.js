var express = require('express')
var mysqlDAO = require('./mySqlDao') // Module for MySQL database operations
var mongoDAO = require('./mongoDAO') // Module for MongoDB database operations
var app = express();

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Start the server on port 3004
app.listen(3004, () => {
    console.log("Server is listening")
})

// Root route that serves a basic homepage
app.get('/', (req, res) => {
    res.send(`
        <h1>G00425067</h1>
        <p><a href="/students">Students</a></p>
        <p><a href="grades">Grades</a></p>
        <p><a href="/lecturers">Lecturers</a></p>
        
    `);
});    

// Route to fetch and display all students
app.get('/students', (req, res) => {
    const search = req.query.search || ''; // Get the search query from the URL
    console.log("Search query:", search); // Log the search term for debugging

    // Call the getStudents function with the search term
    mysqlDAO.getStudents(search)
        .then((data) => {
            console.log("Data fetched:", data); // Log fetched data
            let table = `
                <h1>Students</h1>
                <form method="GET" action="/students">
                    <label for="search">Search by Name:</label>
                    <input type="text" id="search" name="search" value="${search}" placeholder="Enter name">
                    <button type="submit">Search</button>
                </form>
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

            // Loop through student data to build table rows
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

            res.send(table); // Send the constructed table
        })
        .catch((error) => {
            console.error("Error fetching students:", error); // Log any errors
            res.send(`<p>Error: ${error.message}</p><p><a href="/">Back to Home</a></p>`);
        });
});

// Route to fetch and display grades
app.get('/grades', (req, res) => {
    mysqlDAO.getGrades()
        .then((data) => {
            // Build the Grades table
            let gradesTable = `
                <h1>Grades</h1>
                <p><a href="/">Home</a></p>
                <p><a href="/grades-chart">Grade Analysis</a></p>
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
            // Populate table with grade data
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

            res.send(gradesTable); // Send the grades table
        })
        .catch((error) => {
            res.send(`<p>Error: ${error.message}</p><p><a href="/">Back to Home</a></p>`);
        });
});

// Route to fetch and display all lecturers
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
            // Loop through lecturer data to build table rows
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

            res.send(lecturersTable); // Send the lecturers table
        })
        .catch((error) => {
            res.send(`<p>Error: ${error.message}</p><p><a href="/">Back to Home</a></p>`);
        });
});

// Route to display the edit form for a specific student by ID
app.get('/students/edit/:sid', (req, res) => {
    const sid = req.params.sid; // Extract student ID from the request parameters

    mysqlDAO.getStudents() // Fetch all students from the database
        .then((students) => {
            const student = students.find(s => s.sid === sid); // Find the student with the given ID
            if (!student) {
                // If student is not found, display an error message
                res.send(`<p>Student not found</p><p><a href="/students">Back to Students</a></p>`);
                return;
            }
             // Display a form pre-filled with the student's current data
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

// Route to handle the form submission for updating a student
app.post('/students/edit/:sid', (req, res) => {
    const sid = req.params.sid; // Extract student ID from the request parameters
    const { name, age } = req.body; // Extract updated data from the request body

    // Input validation
    const errors = [];
    if (name.length < 2) {
        errors.push("Name must be at least 2 characters long.");
    }
    if (parseInt(age) < 18) {
        errors.push("Age must be 18 or older.");
    }

    if (errors.length > 0) {
        // If there are validation errors, redisplay the form with error messages
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

    // Update the student's details in the database
    mysqlDAO.updateStudent(sid, name, age)
        .then(() => {
            res.redirect('/students'); // Redirect back to the students page on success
        })
        .catch((error) => {
            res.send(`<p>Error: ${error}</p><p><a href="/students">Back to Students</a></p>`);
        });
});

// Route to display the form for adding a new student
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

// Route to handle the form submission for adding a new student
app.post('/students/add', (req, res) => {
    const { sid, name, age } = req.body; // Extract new student data from the request body

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
        // If there are validation errors, redisplay the form with error messages
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
                // If the ID already exists, redisplay the form with an error message
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
                    res.redirect('/students'); // Redirect to the students page on success
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

    // Check if the lecturer teaches any modules using the MySQL DAO
    mysqlDAO.isTeaching(lid)
        .then((isTeaching) => {
            if (isTeaching) {
                // If the lecturer is associated with any modules, display an error message
                res.send(`
                    <p><a href="/">Home</a></p>
                    <h1>Error Message</h1>
                    <h2>Cannot delete lecturer ${lid}. He/She has associated modules </h2>
                `);
            } else {
                // If the lecturer is not teaching any modules, proceed to delete them from MongoDB
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

// Route to provide data for grades analysis in JSON format
app.get('/grades/chart-data', (req, res) => {
    mysqlDAO.getGrades()
        .then((data) => {
            const chartData = {};

            // Process data to find the highest grade for each module
            // Structure: { moduleName: { studentName, grade } }
            data.forEach(row => {
                const moduleName = row.moduleName || 'Unknown Module'; // Default
                const grade = row.grade || 0; // Default
                const studentName = row.studentName || 'Unknown Student'; // Default

                // Update the chartData with the highest grade for each module
                if (!chartData[moduleName] || chartData[moduleName].grade < grade) {
                    chartData[moduleName] = { studentName, grade };
                }
            });

            res.json(chartData); // Send data in JSON format
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});

// Route to display the grades chart
app.get('/grades-chart', (req, res) => {
    mysqlDAO.getGrades()
        .then(() => {
            // Render an HTML page with a canvas element for the grades chart
            res.send(`
                <h1>Grades Chart</h1>
                <p><a href="/">Home</a></p>
                <canvas id="gradesChart" width="800" height="400"></canvas>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script>
                    fetch('/grades/chart-data')
                        .then(response => response.json())
                        .then(data => {
                            const moduleNames = Object.keys(data);
                            const grades = moduleNames.map(module => data[module].grade);
                            const studentNames = moduleNames.map(module => data[module].studentName);

                            const ctx = document.getElementById('gradesChart').getContext('2d');
                            new Chart(ctx, {
                                type: 'bar',
                                data: {
                                    labels: moduleNames,
                                    datasets: [{
                                        label: 'Grades',
                                        data: grades,
                                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                        borderColor: 'rgba(75, 192, 192, 1)',
                                        borderWidth: 1
                                    }]
                                },
                                options: {
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 10
                                            }
                                        }
                                    },
                                    plugins: {
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    const moduleName = context.label;
                                                    const grade = context.raw;
                                                    const studentName = data[moduleName].studentName;
                                                    return 'Grade: ' + grade + ', Student: ' + studentName;
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        })
                        .catch(error => {
                            console.error('Error fetching chart data:', error);
                        });
                </script>
            `);
        })
        .catch((error) => {
            res.send(`<p>Error: ${error.message}</p><p><a href="/">Back to Home</a></p>`);
        });
});

