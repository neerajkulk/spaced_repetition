const SpacedRepLearner = require('./spacedRepLearner');

test('Separate correct and wrong answers', () => {
    const userQuizData = [{ question: 1, correct: true }, { question: 2, correct: false }, { question: 3, correct: false }]
    const quiz = { title: 'test quiz', questions: [1, 2, 3] }
    const learner = new SpacedRepLearner(userQuizData, quiz)

    expect(learner.seperateCorrectAnswers(userQuizData)).toEqual({
        correct: [{
            correct: true,
            question: 1
        }],
        incorrect: [{
            correct: false,
            question: 2
        }, {
            correct: false,
            question: 3
        }]
    })
})


test('Seperate on empty array', () => {
    const userQuizData = []
    const quiz = { title: 'test quiz', questions: [1, 2, 3] }
    const learner = new SpacedRepLearner(userQuizData, quiz)

    expect(learner.seperateCorrectAnswers(userQuizData)).toEqual({
        correct: [],
        incorrect: []
    })
})

test('Store attempted questions in Hash Set', () => {
    const userQuizData = [{ question: 1, correct: true }, { question: 2, correct: false }, { question: 3, correct: false }]
    const quiz = { title: 'test quiz', questions: [1, 2, 3] }
    const learner = new SpacedRepLearner(userQuizData, quiz)
    const expected = new Set(['1', '2', '3'])
    expect(learner.attemptedQuestions(userQuizData)).toEqual(expected)
})

test('Test attemptedQuestions() for empty array', () => {
    const userQuizData = []
    const quiz = { title: 'test quiz', questions: [1, 2, 3] }
    const learner = new SpacedRepLearner(userQuizData, quiz)
    const expected = new Set()
    expect(learner.attemptedQuestions(userQuizData)).toEqual(expected)
})

test('Get first not attempted question', () => {
    const userQuizData = [{ question: 1, correct: true }, { question: 2, correct: false }]
    const quiz = { title: 'test quiz', questions: [1, 2, 3] }
    const learner = new SpacedRepLearner(userQuizData, quiz)
    expect(learner.getNotAttemptedQuestion()).toBe(3)
})

test('Test when all questions have been attempted', () => {
    const userQuizData = [{ question: 1, correct: true }, { question: 2, correct: false }, { question: 3, correct: false }]
    const quiz = { title: 'test quiz', questions: [1, 2, 3] }
    const learner = new SpacedRepLearner(userQuizData, quiz)
    expect(learner.getNotAttemptedQuestion()).toBe(null)
})

test('Get last attempted question if all are correct', () => {
    const userQuizData = [
        {
            question: 1,
            correct: true,
            lastAttempted: Date.now()
        }, {
            question: 2,
            correct: true,
            lastAttempted: Date.now() - 1
        }, {
            question: 3,
            correct: true,
            lastAttempted: Date.now() - 2
        }
    ]
    const quiz = { title: 'test quiz', questions: [1, 2, 3] }
    const learner = new SpacedRepLearner(userQuizData, quiz)
    expect(learner.calcOptimalQuestion()).toBe(3)
})


test('Last attempted question if all are wrong', () => {
    const userQuizData = [
        {
            question: 1,
            correct: false,
            lastAttempted: Date.now()
        }, {
            question: 2,
            correct: false,
            lastAttempted: Date.now() - 1
        }, {
            question: 3,
            correct: false,
            lastAttempted: Date.now() - 2
        }
    ]
    const quiz = { title: 'test quiz', questions: [1, 2, 3] }
    const learner = new SpacedRepLearner(userQuizData, quiz)
    expect(learner.calcOptimalQuestion()).toBe(3)
})

test('Last attempted question some are right and some are wrong', () => {
    const userQuizData = [
        {
            question: 1,
            correct: true,
            lastAttempted: Date.now()
        }, {
            question: 2,
            correct: true,
            lastAttempted: Date.now() - 1
        }, {
            question: 3,
            correct: false,
            lastAttempted: Date.now() - 2
        },
        {
            question: 4,
            correct: false,
            lastAttempted: Date.now() - 3
        }
    ]
    const quiz = { title: 'test quiz', questions: [1, 2, 3,4] }
    const learner = new SpacedRepLearner(userQuizData, quiz)
    const result = learner.calcOptimalQuestion()
    expect(result === 2 || result === 4).toBeTruthy()
})