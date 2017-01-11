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

//gdyby ta funkcja byla po routach to nigdy by tu nie wpadlo
// bez next taka funkcja zakonczyla by przetewarzanie i zablokowala dalszy flow
app.use(function *Time (next){
    console.log('log log')
    var start = new Date;
    //przekazuje kontrole dalej by potem wrocic po wykonaniu funkcji wystepujacych pozniej
    yield next;

    var result = new Date - start;
    console.log(this.body);
    console.log(`is http? ${this.request.is('html')}`);
    console.log(`reesponse type ${this.response.type}`);
    //mozna uzywac this.XXX bez response/request na dorba sprawe

    // np this.response.body zmieniamy na :
    this.body = `${JSON.stringify(this.body)} \n ${start}`;
});

app.use(route.post("/person", savePerson));
app.use(route.get("/person/:id", getPerson));

// obojetne jaki route - lapie wszystko co nie wpadnie w to co wyzej i nie puszcza dalej
app.use(function * (){
    this.body = "test test";
});

//throw funkcji ktora jest iterowa yelduje automatycznie

function *savePerson() {
    var personFormRequest = yield parse(this);

    var person = yield people.insert(personFormRequest);

    this.body = JSON.stringify(person);
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