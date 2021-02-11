const mongoose = require('mongoose');

const userQuizDataSchema = new mongoose.Schema({
    question: {
        type: mongoose.Types.ObjectId,
        ref: 'Question'
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    lastAttempted: {
        type: Date,
        default: Date.now()
    },
    correct: {
        type: Boolean,
        required: true
    }
})

// Question: id
// Quiz: id
// User:id
// LastAttempted:id
// score:Correct/False //Get this from the client

module.exports = mongoose.model('UserQuizData', userQuizDataSchema)

