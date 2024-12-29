const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://127.0.0.1:27017')
    .then((client) => {
    // Once connected, get the `proj2024MongoDB` database
    db = client.db('proj2024MongoDB')
    // Get the `lecturers` collection from the database
    coll = db.collection('lecturers')
    })

    .catch((error) => {
    console.log(error.message)
    })

// Function to find all documents in the `lecturers` collection
function findAll() {
    return new Promise((resolve, reject) => {
        if (!coll) {
            return reject(new Error('Collection not initialized'));
        }
        coll.find()
            .toArray() // Convert the cursor to an array of documents
            .then((documents) => resolve(documents))
            .catch((error) => reject(error));
    });
}

// Function to find all documents in the `lecturers` collection sorted by `_id`
function findAllSorted() {
    return new Promise((resolve, reject) => {
        if (!coll) {
            return reject(new Error('Collection not initialized'));
        }
        coll.find()
            .sort({ _id: 1 }) // Sort documents in ascending order by `_id`
            .toArray() // Convert the cursor to an array of documents
            .then((documents) => resolve(documents))
            .catch((error) => reject(error));
    });
}


// Function to delete a document (lecturer) by its `_id`
function deleteLecturer(_id) {
    return new Promise((resolve, reject) => {
        if (!coll) {
            return reject(new Error('Collection not initialized'));
        }
        coll.deleteOne({ _id: _id }) // Delete the document with the specified `_id`
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
}

// Export the findAll function
module.exports = {
    findAll,
    findAllSorted,
    deleteLecturer
};