var pmysql = require('promise-mysql')

var pool

// Create a connection pool with specified configuration
pmysql.createPool({
    connectionLimit : 3,
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'proj2024mysql' // Database name
    })
    .then((p) => {
    pool = p 
    })
    .catch((e) => {
    console.log("pool error:" + e)
   })

// Function to fetch students, with optional filtering by name
function getStudents(search = '') {
    return new Promise((resolve, reject) => {
        let query, params;

        if (search) {
            query = 'SELECT * FROM student WHERE name LIKE ?';
            params = [`${search}%`]; // Use the search term with wildcard
        } else {
            query = 'SELECT * FROM student';
            params = []; // No parameters if no search term
        }

        pool.query(query, params)
            .then((data) => {
                resolve(data); // Resolve the data if the query is successful
            })
            .catch((error) => {
                reject(error); // Reject with the error if the query fails
            });
    });
}

// Function to retrieve student names, module names, and grades from the database
var getGrades = function() {
    return new Promise((resolve, reject) => {
        //get the student name, module name, and grade.
        pool.query(`
            SELECT 
                s.name AS studentName, 
                m.name AS moduleName, 
                g.grade
            FROM 
                student s
            LEFT JOIN 
                grade g ON s.sid = g.sid
            LEFT JOIN 
                module m ON g.mid = m.mid
            ORDER BY 
                s.name ASC, g.grade ASC
        `) // SQL query to join and retrieve grades with student and module information
        .then((data) => {
            console.log(data)
            resolve(data)
        })
        .catch((error) => {
            console.log(error)
            reject(error)
        })
    })
}

// Function to update a student's information based on their ID (sid)
var updateStudent = function (sid, name, age) {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE student SET name = ?, age = ? WHERE sid = ?', [name, age, sid]) // SQL query to update student details
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// Function to add a new student to the `student` table
var addStudent = function (sid, name, age) {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO student (sid, name, age) VALUES (?, ?, ?)', [sid, name, age]) // SQL query to insert a new student
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// Function to check if a lecturer is teaching any modules
var isTeaching = function (lid) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT COUNT(*) AS count FROM module WHERE lecturer = ?', [lid])  // SQL query to count modules taught by a lecturer
            .then((result) => {
                resolve(result[0].count > 0); // Returns true if count > 0, meaning the lecturer teaches a module
            })
            .catch((error) => {
                reject(error);
            });
    });
};

//Get grade chart
var getGrades = function() {
    return new Promise((resolve, reject) => {
        //get the student name, module name, and grade.
        pool.query(`
            SELECT 
                s.name AS studentName, 
                m.name AS moduleName, 
                g.grade
            FROM 
                student s
            LEFT JOIN 
                grade g ON s.sid = g.sid
            LEFT JOIN 
                module m ON g.mid = m.mid
            ORDER BY 
                s.name ASC, g.grade ASC
        `)
        .then((data) => {
            console.log(data)
            resolve(data)
        })
        .catch((error) => {
            console.log(error)
            reject(error)
        })
    })
}


module.exports = { getStudents, getGrades, updateStudent, addStudent, isTeaching} 