const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://127.0.0.1:27017')
    .then((client) => {
    db = client.db('proj2024MongoDB')
    coll = db.collection('lecturers')
    })

    .catch((error) => {
    console.log(error.message)
    })

// Function to find all documents
function findAll() {
    return new Promise((resolve, reject) => {
        if (!coll) {
            return reject(new Error('Collection not initialized'));
        }
        coll.find()
            .toArray()
            .then((documents) => resolve(documents))
            .catch((error) => reject(error));
    });
}

// Function to find all lecturers sorted by lecturer ID
function findAllSorted() {
    return new Promise((resolve, reject) => {
        if (!coll) {
            return reject(new Error('Collection not initialized'));
        }
        coll.find().sort({ _id: 1 }).toArray()
            .then((documents) => resolve(documents))
            .catch((error) => reject(error));
    });
}


// Function to delete a lecturer by ID
function deleteLecturer(_id) {
    return new Promise((resolve, reject) => {
        if (!coll) {
            return reject(new Error('Collection not initialized'));
        }
        coll.deleteOne({ _id: _id })
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
}

// Function to check if a lecturer teaches any modules
function isTeaching(_id) {
    return new Promise((resolve, reject) => {
        if (!coll) {
            return reject(new Error('Collection not initialized'));
        }
        coll.findOne({ _id: _id, did: { $exists: true, $not: { $size: 0 } } })
            .then((lecturer) => resolve(!!lecturer))
            .catch((error) => reject(error));
    });
}

// Export the findAll function
module.exports = {
    findAll,
    findAllSorted,
    deleteLecturer,
    isTeaching
};