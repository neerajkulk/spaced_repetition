class SpacedRepLearner {
    constructor(userQuizData, quiz) {
        this.userQuizData = userQuizData
        this.quiz = quiz
        this.numQuestions = quiz.questions.length
        this.incorrectPreference = 0.75 // preference for choosing incorrect questions
    }
    seperateCorrectAnswers(userQuizData) {
        const correct = []
        const incorrect = []

        userQuizData.forEach(userAnswer => {
            if (userAnswer.correct) {
                correct.push(userAnswer)
            } else {
                incorrect.push(userAnswer)
            }
        })
        return {
            correct: correct,
            incorrect: incorrect

        }
    }
    attemptedQuestions(userQuizData) {
        const attempted = new Set([])
        userQuizData.forEach(userAnswer => {
            attempted.add(userAnswer.question.toString())
        })
        return attempted
    }
    getNotAttemptedQuestion() {
        const attempted = this.attemptedQuestions(this.userQuizData)
        if (attempted.size === this.numQuestions) return null
        for (let i = 0; i < this.numQuestions; i++) {
            const question = this.quiz.questions[i];
            if (!attempted.has(question.toString())) {
                return question
            }
        }
    }
    calcOptimalQuestion() {
        const numAttempted = this.userQuizData.length
        if (numAttempted < this.numQuestions) {
            return this.getNotAttemptedQuestion()
        }

        const { correct, incorrect } = this.seperateCorrectAnswers(this.userQuizData)

        correct.sort((a, b) => a.lastAttempted - b.lastAttempted)
        incorrect.sort((a, b) => a.lastAttempted - b.lastAttempted)

        if (correct.length === 0) {
            return incorrect[0].question
        }

        if (incorrect.length === 0) {
            return correct[0].question
        }

        const draw = Math.random()

        if (draw <= this.incorrectPreference) {
            return incorrect[0].question
        } else {
            return correct[0].question
        }
    }
}



module.exports = SpacedRepLearner