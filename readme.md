# Spaced Repetition Quiz Application

This is a quiz web application that implements a spaced repetition learning algorithm to help learn things more efficiently. Check out the app at [https://agile-refuge-77893.herokuapp.com/](https://agile-refuge-77893.herokuapp.com/) (it might take a few seconds for the page to load the first time)

## Code

To run the code locally, clone the repository and run the following commands
```
npm install
npm start
```
and then visit http://localhost:3000/ in a browser. 

You'll also need to set a few environment variables. Create a config.env file in the `/config` directory. It should contain two fields:

```
PORT = 3000
MONGO_URI = A URI for connecting to your mongoDB database
```

### Stack:

- **Backend**: `Node.js` (using `Express.js` framework)
- **Database**: `MongoDB` NoSQL Database
- **Frontend**: Serverside rendering with `EJS` templating. Some vanilla javascript and UI built using `Bootstrap` components.
- **Auth**: Session based authentication using `Passport.js` (Local Strategy)
- **Unit Tests** - Jest

The structure of the application follows the MVC design pattern. Database models are stored in the `/models/` directory. HTML templates are in the `/views/` directory and the `/routes/` contains the controller logic for serving the endpoints.

## Database System

For this project, I use a `MongoDB` NoSQL database because it integrates quite well with `node.js` applications. I decided to use `MongoDB` primarily for its ability to store unstructured data as `JSON` style documents. The database is hosted on MongoDB Atlas which is an easy way to use MongoDB in the cloud. In this application there are 4 data schemas containing the respective fields:

1. User:
   - email
   - Hashed Password
   - User Type [Student, Instructor, Guest]
   - Date Registered
2. Questions:
   - Question
   - Answer
3. Quizzes:
   - Title
   - Array of Question Id's
4. User Quiz Data:
   - QuestionId
   - UserId
   - last Attempted
   - correct

The `User` schema contains fields necessary for authenticating users. We also include a `userType` field to manage permissions within the application. For example, only students are allowed to take quizzes and only instructors are allowed to create, edit and delete quizzes.

The `Question` schema is pretty simple. It just contains a question and an answer - both of which are stored as strings

The `Quizzes` schema contains a title for the quiz and a list of questions stored as an array of Question Id's

In order to implement a spaced repetition algorithm that's tailored to each user, we store the user's past performance on each question. This is stored in the `userQuizData` schema. For each question a user attempts, we store the date that the question was last attempted and a boolean indicating whether the user got the question correct.

## Backend

There are two main components to the server-side code:

1. A spaced repetition algorithm for students taking a quiz
2. CRUD functionality for instructors to create and edit quizzes.

### 1) Spaced Repetition algorithm

The main route for students is `/quiz/:quizId`. When a student accesses this route, we query the DB to retrieve the quiz associated with the quizId as well as all of the user's past attempts on questions in the quiz. This information gets passed to a `SpacedRepLearner` class defined in `spacedRepLearner.js`. The relevant method of this class is `calcOptimalQuestion()`. It picks the optimal question to give the user according to the following rules:

1. If there is a question in the quiz the student has not attempted, give the student this question.
2. Separate out the attempted questions by whether the student answered them correctly the last time.
3. Sort the correct and incorrect questions by last attempted date.
4. Pick the oldest incorrect question (with a 75% probability)
5. Or else pick the oldest correct question (with a 25% probability).

75% is just a number I decided on after some trial and error. I found that having incorrect questions appear around 3x as frequently as correct questions works well for learning quickly. But in theory, the probability could also be adjusted for each user.

> Note that it's not necessary to fully sort the questions by their date (which takes O(N logN)). We really just want the oldest question which can be done in O(N). But, so long as the number of questions in a quiz doesn't grow too large, the additional time complexity is not a concern.

Since the spaced repetition system is such a critical component of the application, `spacedRepLearner.test.js` contains unit and integration tests. We test that:

- we can separate out correct answers from wrong answers in the `userQuizData`.
- we can identify previously attempted vs unattempted question based on Id.
- if all questions are correct, we should return the oldest correctly answered question (same thing if all questions are wrong)
- In the general case, we either return the oldest correctly answered question (with 25 % probability) or the oldest incorrectly answered question (with 75 % probability)

To get a hands on feeling of how the spaced repetition quiz works, try taking the 'Spaced Repetition Demo' quiz as a student. If you answer a question wrong, notice that this question appears more frequently. If you answer all questions right, notice how the code keeps cycling through the questions in order, giving you the oldest attempted question.

> See how quickly you can master the material in the 'General Questions' quiz. It contains random trivia which you can learn quickly using spaced repetition

### 2) CRUD functionality for instructors to create and edit quizzes

The creation of a quiz is handled by the `/create-quiz` and `/edit-quiz/:id` routes. For the GET requests, we send server-side rendered templates to the client (`/views/create-quiz.ejs`). This is essentially a HTML table where each row contains an input field for questions and answers.

The `/create-quiz` POST endpoint handles storing these quizzes to the database. Depending on whether a question Id is present in the DB, we create a new question or update the existing question in the DB. We then update the array of questions for the corresponding quiz (deleting old questions if necessary).

When the user wants to edit the questions in a quiz, we pre-populate the HTML table with the current quiz questions retrieved from the database.

Additionally we provide basic analytics for the instructor to view the scores of students. He is able to view the number of questions the student has attempted as well as the accuracy of their responses.

In various places the logic in the controllers has been refactored in to helper functions that are stored in `/helpers.js`. These functions also have unit test coverage in `/helpers.test.js`

## Client UI/UX

Rather than using a full fledged front end framework (eg React, Angular) I have chosen to use mostly server side rendered templates and vanilla javascript when necessary. I have chosen not to use a front-end framework since the UI for this application is relatively simple and doesn't require a whole lot of dynamic javascript functionality or state management.

`EJS` also allows for component re-use which is helpful for reusing common components like the navbar across different pages of the application. I have also made use of bootstrap components to create a responsive design. As such, the application is usable on mobile phones as well.

When a student types in their answer for a quiz, the client makes a POST request using the `fetch` API to update the data in `userQuizData` collection based on whether the user answered the question correctly. This is in `/views/quiz.ejs`.

I also used some basic javascript to add and remove rows when creating a set of questions for a quiz. This is done in `/views/create-quiz.ejs`

This server-side rendered UI is suitable for the current application. However, as the app complexity increases I would decouple the frontend and backend. For example, the backend would return a REST API which could be consumed by the frontend to render components using a framework like React.js. Redux can also be used to manage state across various react components.

## Auth

When writing authentication for an application, we can choose between session based authentication and token based authentication (e.g. JSON web tokens). The main difference is that the user's state is stored on the server in session based authentication vs being stored on the client in token based authentication.

Token based authentication is typically better for scalability and also allows authentication from mobile devices. However for this project I have chosen session based authentication primarily because I am more familiar with it and it's easier to implement.

Another commonly used option is to use the user's social login (e.g. Google, Facebook, GitHub) to create a API token that can authenticate the users. This is also a good solution and has the benefit of not storing sensitive information on the server. However for this project, I wanted to be able to create a whole bunch of users without necessarily having to register a third party email every-time.

I used passport JS to implement session based authentication. The Users collection stores the email and the hashed password. Then passport handles the adding the userId to the session and serializing and deserializing the user. In order to protect routes, I have implimented middleware in `/middleware/auth.js` to handle different permissions associated with Students, Instructors and Guests.

Instructors can create and edit quizzes but are not allowed to take quizzes. They can also view analytics of how well the students are performing. Students can only take quizzes. And Guests can only view the available quizzes.

Where appropriate, I have also implimented flash messaging informing the user that they need to be authenticated before accessing a certain endpoint.


Lastly, I'm using heroku for hosting the app. Check it out at [https://agile-refuge-77893.herokuapp.com/](https://agile-refuge-77893.herokuapp.com/)