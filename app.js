/*
	DEPENDENCIES ------------------------------------------------------------------------------------------------------
*/
const express = require('express');
const { ApolloServer } = require('apollo-server-express');


const typeDefs = require('./graphQLSchema');
const resolvers = require('./graphQLResolvers');

/*
	SETUP ------------------------------------------------------------------------------------------------------------
*/

const app = express();

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

/*
	SETUP & EXPORTS ---------------------------------------------------------------------------------------------------
*/

// 500 Error from Apollo
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
	res.status(500).json({ error: true, message: err.message });
});

app.listen(3000, () => {
	console.info(`🚀 App API listening on port 3000 Graphql running on http://localhost:3000${server.graphqlPath}`);
});