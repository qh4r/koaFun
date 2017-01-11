const PORT = 3000;

const koa = require('koa');
const app = koa();

let route = require('koa-route');

//mongo db
const monk = require('monk');
const wrap = require('co-monk');
const db = monk('127.0.0.1/koa_people');
// wrapuje endpoint by mozna bylo zuywac na nim generatorow
const people = wrap(db.get('people'));

app.use(route.post("/person", savePerson));
app.use(route.get("/person/:id", getPerson));

// obojetne jaki route
app.use(function * (){
    this.body = "test test";
});

function *savePerson() {
    var personFormRequest = yield parse(this);

    var person = yield people.insert(personFormRequest);

    this.body = person;
    this.set("Location", "/person/" + person._id)
    this.status = 201;
}

function *getPerson(id){
    console.log('ideeee',id)
    var person = yield people.findOne({_id: id});

    this.body = person || 'not found';
    this.status = 200;
}

app.listen(PORT);
console.log(`listening on port: ${PORT}`);