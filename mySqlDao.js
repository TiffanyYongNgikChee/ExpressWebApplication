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

// Function to retrieve all students from the `student` table
var getStudents = function() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM student') // SQL query to get all student records
        .then((data) => {
            console.log(data)
            resolve(data) // Resolve the promise with the retrieved data
        })
        .catch((error) => {
            console.log(error)
            reject(error) // Reject the promise with the error
        })
    })
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