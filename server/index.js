const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {PORT} = require('./constants');
const db_module = require('./test.js')
const app = express();

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

console.log("you need to run mongodb on localhost port 27017 for this program to work");

app.get('/movies/populate/:id', (req, response) => {
	const actor = req.params.id;
	db_module.insert_actor_movies(actor).then(function(result){
	response.send(result);
})
});

app.get('/movies', (req, response) => {
	db_module.find_mustwatch_movies().then(function(result){
	response.send(result);
})
});

app.get('/movies/:id', (req, response) => {
	const mov_id = req.params.id;
	db_module.find_specific_movies(mov_id).then(function(result){
	response.send(result);
})
});

app.get('/movies/search', (req, response) => {
	console.log(req.query);
	var lim = 2;
	var min_meta = 0;
	if(req.query.hasOwnProperty(limit)){
		lim = req.query.limit
	}
	if(req.query.hasOwnProperty(metascore)){
		min_meta = req.query.metascore
	}
	response.send("hello")
	db_module.search_movies(lim, min_meta).then(function(result){
	response.send(result);
})
});


app.post('/movies/:id', function (req, response) {
	var review = req.body.review;
	var review_date = req.body.date;
	const id = req.params.id;
	db_module.post_review(id, review, review_date).then(function(result){
	response.send(result);
})
});


app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);

module.exports = app;

