import express from 'express';
import {graphqlHTTP} from "express-graphql";
import cors from 'cors'
import {schema} from "./schema";

const app = express()
app.use(cors())

//db mock
const users = [{id:1, username: 'name', age: 25}]

const root = {
    getAllUsers: () => {
        return users
    },
    getUser: ({id}) => {
        return users.find(user=>user.id===id)
    },
    createUser: ({input}) => {
        const id = Date.now()
        const user =  {
            ...input,
            id
        }
        users.push(user)
        return user
    }
}

app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema: schema,
    rootValue: root
}))

app.listen(5000, ()=>console.log('sever started on 5000 port'))