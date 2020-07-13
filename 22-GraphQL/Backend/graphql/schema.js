const { buildSchema } = require('graphql');

// define graphql schema
// queries are the parts where you get data from RootQuery that you define
// hello - query name
// : - return
// String - type of data it returns
// ! - makes data required, in our case if we don't pass string, we get an error
// module.exports = buildSchema(`
//   type TestData {
//     text: String!
//     views: Int!
//   }

//   type RootQuery {
//     hello: TestData
//   }

//   schema {
//     query: RootQuery
//   }
// `);

// createUser requires input
// () - specify arguments that have to be given to that resolver
// input - data that is used as a input/argument
// ID - will signal graphql that this value is unique and will treat it as an id
// type User - define what we will be returning
// type Post - define how a post will look like

// createUser(userInput: UserInputData): User!
// when we create an user, we accept it's input data, and then we will return that user, and also it's posts

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type PostData {
        posts: [Post!]!
        totalPosts: Int!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int): PostData!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
