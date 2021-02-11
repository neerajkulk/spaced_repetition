const User = require('./models/User')
const Question = require('./models/Question')

module.exports = {
    groupUserId: function (userDocuments) {
        const groupByUserId = {}
        for (const userAnswer of userDocuments) {
            if (userAnswer.user in groupByUserId) {
                groupByUserId[userAnswer.user].push(userAnswer)
            } else {
                groupByUserId[userAnswer.user] = [userAnswer]
            }
        }
        return groupByUserId
    },
    populateUserData: async function (groupByUserId) {
        try {
            const userGrouped = []
            for (const userId in groupByUserId) {
                user = await User.findById(userId).lean()
                userGrouped.push({
                    user: user,
                    data: groupByUserId[user._id]
                })
            }
            return userGrouped
        } catch (error) {
            console.error(error)
        }
    },
    calcStats: function (userData) {
        let correct = 0
        userData.forEach(answer => {
            if (answer.correct) correct += 1
        })
        const accuracy = userData.length > 0 ? Math.round(100 * correct / userData.length) : 0
        return { accuracy: accuracy, questionsAttempted: userData.length }
    },
    parseQuizForm: function (reqBody) {
        const quizQuestions = []

        if (reqBody['questions[]'] === undefined) {
            reqBody['questionId[]'] = []
            reqBody['questions[]'] = []
            reqBody['answers[]'] = []
        }

        if (typeof reqBody['questions[]'] === 'string') {
            reqBody['questionId[]'] = [reqBody['questionId[]']]
            reqBody['questions[]'] = [reqBody['questions[]']]
            reqBody['answers[]'] = [reqBody['answers[]']]
        }

        for (let i = 0; i < reqBody['questions[]'].length; i++) {
            const id = reqBody['questionId[]'][i] != '' ? reqBody['questionId[]'][i] : undefined
            quizQuestions.push({
                questionId: id,
                question: reqBody['questions[]'][i],
                answer: reqBody['answers[]'][i]
            })
        }
        return quizQuestions
    },
    createOrUpdateQuestion: async function (questionJSON) {
        try {
            const questionExists = questionJSON.questionId != undefined

            if (questionExists) {
                question = await Question.findById(questionJSON.questionId)
                question.question = questionJSON.question
                question.answer = questionJSON.answer
            } else {
                question = new Question(questionJSON)
            }

            return question

        } catch (error) {
            console.error(error)
        }
    },
    deleteUnusedQuestions: async function (oldQuestions, newQuestions) {
        try {
            oldQuestions = new Set(oldQuestions.map(id => id.toString()))
            newQuestions = new Set(newQuestions.map(id => id.toString()))
            oldQuestions.forEach(async (oldId) => {
                if (!newQuestions.has(oldId)) {
                    await Question.deleteOne({ _id: oldId })
                }
            })

        } catch (error) {
            console.error(error)
        }
    }
}