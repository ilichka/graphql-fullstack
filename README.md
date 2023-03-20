# Here you will find a snippet about graphql.

GraphQl determine how to fetch data. 


## HTTP vs GraphQl

### HTTP

On server we have endpoints GET/POST/PUT/DELETE. And some endpoint give us a lot of information.
For example about user. But on current page we only need few fields with data. GraphQl solves this
problem. When we make a request to server we say: give us only this and this field. At this time,
server connects to database and receive all users with all information. But! The response,
that it returns to us consists only required fields.

### Main GraphQl concepts

At GraphQl we start from creating a schema. There we describe type, mutations, requests.

1. Schema is a simple description of data.
`Schema example:`
```typescript
    type User {
    id: ID,
        username: String,
        age: Int,
        posts: [Post]
}
```

2. Query describes what data we should receive from server.

`Query example:`
```typescript
query{
    users{
        username
        age
    }
}
```

In this case we take only username and age fields from user.

3. Mutation allows to update data(HTTP POST/PUT).

`Mutation example:`
```typescript
mutation createUser{
    addUser(username: "Name", age: 22) {
        id, username
    }
}
```

4. Subscription. With subscription client listens changes in database in real time. Under the hood
it uses web-sockets. 

```typescript
subscription listenPostLikes {
    listenPostLikes {
        title
        likes
    }
}
```

Let's create client and server side.

### `npx create-react-app client --template typescript`

And server folder is empty for now.

Move to server folder and init project

### `npm init -y`

### `npm install express @types/express @types/cors graphql express-graphql cors nodemon ts-node concurrently`

Enable cors 

```typescript
const app = express()
app.use(cors())
```

Add graphql middleware

```typescript
app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema: schema
}))
```

And before this create schema:

```typescript
import {buildSchema} from "graphql";

export const schema = buildSchema(`

    type User {
        id: ID
        username: String
        age: Int
        posts: [Post]
    }
    type Post {
        id: ID
        title: String
        content: String
    }
    
    input UserInput {
        id: ID
        username: String!
        age: Int!
        posts: [PostInput]
    }
    
    input PostInput {
        id: ID
        title: String!
        content: String!
    }
    
    type Query {
        getAllUsers: [User]
        getUser(id: ID): User
    }
`)
```

`!` === required. input marks that it would be a mutation.


Create a resolver:

```typescript
//db mock
const users = []

const root = {
    getAllUsers: () => {
        return users
    },
    getUser: ({id}) => {
        return users.find(user=>user.id===id)
    }
}

app.use('/graphql', graphqlHTTP({
    //...
    
    rootValue: root
}))
```

Add mutations to schema

```typescript
`
type Mutation {
        createUser(input: UserInput): User
    }
    `
```

Examples of requests: 

```
query {
  getAllUsers {
    age, username
  }
}
```

```
mutation {
  createUser(input: {
    username: "123"
    age: 22
  }) {
    id, username
  }
}
```

```
query {
  getAllUsers {
    age, username, posts {
      id, content
    }
  }
}
```

## Client side

### `npm install @apollo/client graphql`

Setup apollo client:

```typescript jsx
import {ApolloProvider, ApolloClient, InMemoryCache} from "@apollo/client";

const client = new ApolloClient({
    uri: 'http://localhost:5000/graphql',
    cache: new InMemoryCache()
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
```

Then we create our first query on FE part:

```typescript
import {gql} from "@apollo/client";

export const GET_ALL_USERS = gql`
    query {
        getAllUsers {
            id, username, age
        }
    }
`
```

To use it we have `useQuery` hook

```typescript
  const {data, loading, error} = useQuery(GET_ALL_USERS)
```

Now lets create some mutations:

```typescript
import {gql} from "@apollo/client";

export const CREATE_USER = gql`
    mutation createUser($input: UserInput) {
        createUser(input: $input) {
            id, username
        }
    }
`
```

To use it we have `useMutation` hook:

```typescript
const [newUser] = useMutation(CREATE_USER)
```

One more query:

```typescript
export const GET_ONE_USER = gql`
    query getUser($id: ID){
        getUser(id: $id) {
            id, username
        }
    }    
`
```

```typescript
const {data:oneUser, loading: loadingOneUser} = useQuery(GET_ONE_USER, {
    variables: {
      id: 1
    }
  })
```

Also one important thing is `fragment`. If we have a lot of places where we need to return
the same information, we can create fragment for this purpose and reuse it:

```
fragment userWithoutAge on User {
    id, username, posts {
        title, content
    }
}

query {
    getAllUser {
        ...userWithoutAge
    }
}
```