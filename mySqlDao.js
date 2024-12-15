var pmysql = require('promise-mysql')

var pool

pmysql.createPool({
    connectionLimit : 3,
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'proj2024mysql'
    })
    .then((p) => {
    pool = p
    })
    .catch((e) => {
    console.log("pool error:" + e)
   })


var getStudents = function() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM student')
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

var getGrades = function() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM grade')
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

// New function to update a student
var updateStudent = function (sid, name, age) {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE student SET name = ?, age = ? WHERE sid = ?', [name, age, sid])
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// Add a new student to the database
var addStudent = function (sid, name, age) {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO student (sid, name, age) VALUES (?, ?, ?)', [sid, name, age])
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};



module.exports = { getStudents, getGrades, updateStudent, addStudent} 