const PORT = 3000;
const koa = require('koa');
const routes = require('koa-route');
const body = require('co-body');
const monk = require('monk');
const monkWrap = require('co-monk');

const app = koa();
const people = monkWrap(monk('127.0.0.1/koa_people').get('people'));

app.use(routes.post('/person', addPerson));
app.use(routes.get('/person/:_id', getPerson));
app.use(routes.put('/person/:_id', updatePerson));
app.use(routes.del('/person/:_id', deletePerson));

function *addPerson() {
    let personForm = yield body(this);
    if (!personForm.name) {
        this.throw(400, 'imie wymagane');
    }
    let newPerson = yield people.insert(personForm);

    this.set('location', `/person/${newPerson._id}`);
    this.status = 201;
}

function *getPerson(_id) {
    let person = yield people.findOne({_id});

    [this.body, this.status] = [person || 'nie znaleziono', 200];
}

function *updatePerson(_id) {
    let userForm = yield body(this);
    try {
        yield people.update({_id}, userForm);
    }
    catch (ex) {
        this.throw(500, ex.message);
    }
    this.body = 'ok';
    this.status = 204
}

function *deletePerson(_id) {
    try {
        yield people.remove({_id});
    }
    catch (ex) {
        this.throw(500, ex.message);
    }
    this.status = 200;
}

app.listen(PORT);