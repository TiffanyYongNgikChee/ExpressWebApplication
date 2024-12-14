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

// Export the findAll function
module.exports = {
    findAll,
};