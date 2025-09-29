import express from 'express';
import bodyParser from 'body-parser';
import connect from './config/db_config.js';

import NoteRepository from './repository/note-repository.js';
import UserRepository from './repository/user-repository.js';

const noteRepository = new NoteRepository();
const userRepository = new UserRepository();

const app = express();
const port = 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));



app.get('/', (req, res) => {
    res.send("hello world")
});

app.post('/createUser', async (req, res) =>{                  //create user
    console.log('req reqched for creating');
    console.log(req.body);
    const user = await userRepository.create({
        name: req.body.name,
        associateNotes: req.body.associateNotes
    });
    console.log('user created');
    res.json(user);
})



app.post('/addNotes', async (req, res) => {       // creating notes
    const note = await noteRepository.create({
        content: req.body.content,
        //contributors: req.body.contributors
        owner: req.body.owner                   
    });
    console.log('no response was send');
    res.json(note);
})


app.patch('/addContributor', async (req, res) => {      // we'll get user's id from frontend
    try {
        // Fetch the note by its id
        const note = await noteRepository.get(req.body.noteId);
        console.log(req.body.noteId);

        // Check if userId is already a contributor
        if (!note.contributors.includes(req.body.userId)) {
            note.contributors.push(req.body.userId);

            // Update the note's contributors array in the database
            await noteRepository.update(req.body.noteId, { contributors: note.contributors });
        } else {
            console.log('this user is already present as contributor');
        }
 
        console.log(note.contributors);

        res.json({ contributors: note.contributors });
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
})




app.patch('/addAssociateNotes', async(req, res) => {   
    try {
        const user = await userRepository.get(req.body.userId);

        // if not present
        if (!user.associateNotes.includes(req.body.noteId)) {
            user.associateNotes.push(req.body.noteId);

            await userRepository.update(req.body.userId, { associateNotes: user.associateNotes });
        } else {
            console.log('this noteId is already present in associateNote field or this user');
        }

        res.json({ associateNotes: user.associateNotes });
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }

})




app.listen(port, async () => {
    console.log(`listening on ${port}`);
    await connect();
    console.log('mongo Db connected');
});