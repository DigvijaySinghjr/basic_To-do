import express from 'express';
import bodyParser from 'body-parser';
import connect from './config/db_config.js';

import NoteRepository from './repository/note-repository.js';

const noteRepository = new NoteRepository();

const app = express();
const port = 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));



app.get('/', (req, res) => {
    res.send("hello world")
});

app.post('/addNotes', async (req, res) => {
    console.log(req.body);

    const note = await noteRepository.create({
        content: req.body.content,
        contributors: req.body.contributors
    });
    console.log('no response was send');
    res.json(note);
})


app.listen(port, async () => {
    console.log(`listening on ${port}`);
    await connect();
    console.log('mongo Db connected');
});