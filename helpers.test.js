const helper = require('./helpers');

test('group users by Id', () => {
    expect(helper.groupUserId([
        { user: '1', data: 'a' },
        { user: '2', data: 'b' },
        { user: '1', data: 'c' }
    ])).toEqual(
        {
            '1': [{
                data: "a",
                user: "1"
            }, {
                data: "c",
                user: "1"
            }],
            '2': [{
                data: "b",
                user: "2"
            }]
        }
    )
})

test('Statistics for empty array', () => {
    expect(helper.calcStats([])).toEqual({ accuracy: 0, questionsAttempted: 0 })
})

test('Correct calculation of accuracy', () => {
    expect(helper.calcStats([{ correct: true }, { correct: false }, { correct: true }])).toEqual({ accuracy: 67, questionsAttempted: 3 })
})


test('Parse empty request', () => {
    expect(helper.parseQuizForm({})).toEqual([])
})

test('Convert single question to array', () => {
    expect(helper.parseQuizForm({
        'questionId[]': '1',
        'questions[]': 'what is 1+1?',
        'answers[]': '2'
    })).toEqual([{
        answer: "2",
        question: "what is 1+1?",
        questionId: "1"
    }])
})

test('Convert multiple questions to array', () => {
    expect(helper.parseQuizForm({
        'questionId[]': ['1', ''],
        'questions[]': ['what is 1+1?', 'new question'],
        'answers[]': ['2', 'new answer']
    })).toEqual([{
        answer: "2",
        question: "what is 1+1?",
        questionId: "1"
    }, {
        answer: "new answer",
        question: "new question",
        questionId: undefined
    }])
})