const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Question = require('../models/Question')
const Quiz = require('../models/Quiz')
const UserQuizData = require('../models/UserQuizData')
const SpacedRepLearner = require('../spacedRepLearner')
const helper = require('../helpers')
const bcrypt = require('bcrypt')
const { ensureAuth, ensureGuest, ensureInstructor, ensureStudent } = require('../middleware/auth');

router.get('/', ensureGuest, (req, res) => {
    res.render('login', { flash: req.flash() })
})


router.get('/analytics', ensureInstructor, async (req, res) => {
    try {
        const allAnswerData = await UserQuizData.find({})
        const grpById = helper.groupUserId(allAnswerData)
        const userGroupedAnswers = await helper.populateUserData(grpById)

        const stats = userGroupedAnswers.map(user => { return { user: user.user, stats: helper.calcStats(user.data) } })
        res.render('analytics', { user: req.user, stats: stats })
    } catch (error) {
        console.error(error)
    }

})



router.get('/quizzes', ensureAuth, async (req, res) => {
    try {
        const quizzes = await Quiz.find({}).lean()
        res.render('quizzes', { quizzes: quizzes, user: req.user })
    } catch (error) {
        console.error(error)
    }
})


router.post('/user-quiz-data', ensureStudent, async (req, res) => {
    try {
        const pastSubmission = await UserQuizData.findOne({ question: req.body.questionId, user: req.user._id })
        if (pastSubmission) {
            pastSubmission.lastAttempted = Date.now()
            pastSubmission.correct = req.body.correct
            await pastSubmission.save()
        } else {
            const newSubmission = new UserQuizData({
                question: req.body.questionId,
                user: req.user._id,
                lastAttempted: Date.now(),
                correct: req.body.correct
            })
            await newSubmission.save()
        }
        res.sendStatus(200)

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/quiz/:quizId', ensureStudent, async (req, res) => {

    try {
        const quiz = await Quiz.findById(req.params.quizId).lean()
        const userQuizData = []

        for (const question of quiz.questions) {
            const userAnswer = await UserQuizData.findOne({ question: question, user: req.user._id }).lean()
            if (userAnswer) userQuizData.push(userAnswer)
        }

        const spacedRepLearner = new SpacedRepLearner(userQuizData, quiz)
        const questionId = spacedRepLearner.calcOptimalQuestion()
        const question = await Question.findById(questionId)

        res.render('question', { quiz: quiz, question: question, user: req.user })
    } catch (error) {
        console.error(error)
        res.redirect('/quizzes')
    }

})

router.post('/create-quiz', ensureInstructor, async (req, res) => {
    try {
        const questionIds = []
        for (const parsedQuestion of helper.parseQuizForm(req.body)) {
            const question = await helper.createOrUpdateQuestion(parsedQuestion)
            await question.save()
            questionIds.push(question._id)
        }

        let quiz
        if (req.body.quizId === '') {
            quiz = new Quiz({
                title: req.body.title,
                questions: questionIds
            })
        } else {
            quiz = await Quiz.findById(req.body.quizId)
            await helper.deleteUnusedQuestions(quiz.questions, questionIds)
            quiz.title = req.body.title
            quiz.questions = questionIds
        }

        await quiz.save()

    } catch (error) {
        console.error(error)
    }
    res.redirect('/quizzes')
})


router.get('/create-quiz', ensureInstructor, (req, res) => {
    res.render('create-quiz', { user: req.user, quiz: {} })
})

router.get('/edit-quiz/:quizId', ensureInstructor, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('questions').lean()
        res.render('create-quiz', { quiz: quiz, user: req.user })
    } catch (error) {
        console.error(error)
        res.redirect('/quizzes')

    }
})


router.delete('/delete-quiz', ensureInstructor, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.body.quizId)
        for (const question of quiz.questions) {
            await Question.deleteOne({ _id: question })
            await UserQuizData.deleteMany({ question: question })
        }
        await quiz.deleteOne()
        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})


router.get('/register', ensureGuest, (req, res) => {
    res.render('register', { flash: req.flash() })
})

router.post('/register', ensureGuest, async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email })
        if (userExists) {
            req.flash('error', 'User Already Exists')
            res.redirect('/register')
            return
        }
        const newUser = new User({
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            userType: req.body.userType
        })
        await newUser.save()
        req.flash('success', `${newUser.email} has been registered`)
        res.redirect('/')
    } catch (error) {
        console.error(error)
    }

})

module.exports = router
