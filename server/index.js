const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {PORT} = require('./constants');
const db_module = require('./test.js') //mongodb handler
const graphqlHTTP = require('express-graphql');
const app = express(); //restful server

//graphql imports
var { graphql, buildSchema } = require('graphql');

//graphql schema (not finished)
var graph_schema = buildSchema(`
  type Query {
    movies: String
  }
`);

//resolving graphql queries (not finished)
var root = {
  movies: () => {
    return null;
  },
};

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

console.log("you need to run mongodb on localhost port 27017 for this program to work");

app.get('/movies/populate/:id', (req, response) => { //sends back the number of results inserted into mongodb
	const actor = req.params.id;
	db_module.insert_actor_movies(actor).then(function(result){
	response.send(result);
})
});

app.get('/movies', (req, response) => { //returns a random must watch movie
	db_module.find_mustwatch_movies().then(function(result){
	response.send(result);
})
});

app.get('/movies/:id', (req, response) => { //returns a movie with a specific id
	const mov_id = req.params.id;
	db_module.find_specific_movies(mov_id).then(function(result){
	response.send(result);
})
});

app.get('/movies/search', (req, response) => { //doesn't work though the underlying db_module function does
	//console.log(req.query); //debug line
	var lim = 2;
	var min_meta = 1;
	min_meta = req.query.metascore;
	lim = req.query.limit;
	db_module.search_movies(lim, min_meta).then(function(result){
	response.send(result);
})
});


app.post('/movies/:id', function (req, response) { //saves a review into the database
	var review = req.body.review;
	var review_date = req.body.date;
	const id = req.params.id;
	db_module.post_review(id, review, review_date).then(function(result){
	response.send(result);
})
});

//graphql endpoints
/*
app.post(
  '/graphql',
	function(req , response){
		graphql(schema, req.body, root).then((response) => {
		console.log(response);
		});
	}
);

app.get(
  '/graphql',
  graphqlHTTP({
    schema: graph_schema,
	rootValue: root,
    graphiql: true,
  }),
);
*/


app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);

module.exports = app;

