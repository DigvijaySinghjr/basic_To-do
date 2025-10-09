import express from 'express';
import bodyParser from 'body-parser';
import connect from './config/db_config.js';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import 'dotenv/config'


import './config/passport-config.js';

import { addAssociateNotes, removeAssociateNotes } from '../helper.js';

import NoteRepository from './repository/note-repository.js';
import UserRepository from './repository/user-repository.js';
import { ensureAuthenticated, authorize } from './middleware/authMiddleware.js';

const noteRepository = new NoteRepository();
const userRepository = new UserRepository();

const app = express();
const port = 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));



app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  
 
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost/test-app',
    ttl: 14 * 24 * 60 * 60, // = 14 days. Default,
    autoRemoveInterval: 60 * 1  // 1 min in seconds
  })

}))

//Auth passport
// Initialize passport
app.use(passport.initialize());
app.use(passport.session());



app.get('/auth/login',
    passport.authenticate('google', { scope: ['profile', 'email'] }));
  
    
  app.get('/auth/login/callback',
    passport.authenticate('google', {
      failureRedirect: '/',
      successRedirect: '/me'
    })
  );

// This route returns the authenticated user's info, or 401 if not logged in
app.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  return res.json({ user: req.user });
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



app.post('/addNotes', ensureAuthenticated, authorize('addNotes'), async (req, res) => { // creating notes
    try {
        const note = await noteRepository.create({
            content: req.body.content,
            //contributors: req.body.contributors
            owner: req.user.id
        });

        // Wait for associateNotes to be updated before responding
        await addAssociateNotes(req.user.id, note.id); // id of note is generated just above

        res.json(note);
    } catch (error) {
        console.error('Error in /addNotes:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});


// The noteId should be provided as a route parameter, not a literal string.
// So, use :noteId in the route to get it from the URL.
app.patch('/updateNotes/:noteId', ensureAuthenticated, authorize('updateNotes'), async (req, res) => {
    try {
        // Only owner or contributor can update
        const current = await noteRepository.get(req.params.noteId);
        const userId = req.user.id;
        const isOwner = current && String(current.owner) === String(userId);
        const isContributor = current && current.contributors && current.contributors.map(String).includes(String(userId));
        if (!isOwner && !isContributor) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const note = await noteRepository.update(req.params.noteId, {
            content: req.body.content
        });
        return res.json(note)
    } catch (error) {
        console.log('failed to update the notes', error);
        res.status(500).json({ error: 'failed to update note' });
    }
})

app.get('/getNotes/:noteId', ensureAuthenticated, authorize('getNotes'), async (req, res) => {          
    try {
        const userId = req.user.id;               // fetch userId from session
        const note = await noteRepository.getForUser(req.params.noteId, userId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found or no access' });
        }
        return res.json(note)
    } catch (error) {
        console.error('failed to fetch notes:', error);
        res.status(500).json({error: 'failed to fetch note'});
    }
})

app.get('/getAllNotes', ensureAuthenticated, authorize('getAllNotes'), async (req, res) => {          
    try {                                                  // fetch userId from session and  (not provided in params or body)
        const userId = req.user.id;
        const notes = await noteRepository.getAllForUser(userId);
        return res.json(notes)
    } catch (error) {
        console.error('failed to fetch notes:', error);
        res.status(500).json({error: 'failed to fetch notes'});
    }
})

app.delete('/deleteNotes/:noteId', ensureAuthenticated, authorize('deleteNotes'), async (req, res) => {
    try {
        // Only owner can delete
        const current = await noteRepository.get(req.params.noteId);
        const userId = req.user.id;
        const isOwner = current && String(current.owner) === String(userId);
        if (!isOwner) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const notes = await noteRepository.destroy(req.params.noteId)
        return res.json(notes)
    } catch (error) {
        console.error('failed to delete the note:', error);
        res.status(500).json({error: 'failed to delete note'});
    }
})

app.patch('/removeContributor', ensureAuthenticated, authorize('removeContributor'), async (req, res) => {
    try {
        const note = await noteRepository.get(req.body.noteId);
        const idx = note.contributors.indexOf(req.body.userId);
        if (idx !== -1) {
            note.contributors.splice(idx, 1);
            await noteRepository.update(req.body.noteId, { contributors: note.contributors });
            removeAssociateNotes(req.body.userId, req.body.noteId);
        }
        res.json({ contributors: note.contributors });
    } catch (error) {
        console.error('failed to remove contributor:', error);
        res.status(500).json({ error: 'failed to remove contributor' });
    }
});


app.patch('/addContributor', ensureAuthenticated, authorize('addContributor'), async (req, res) => {      // we'll get user's id from frontend
    try {
        // Fetch the note by its id
        const note = await noteRepository.get(req.body.noteId);
        console.log(req.body.noteId);

        // Check if userId is already a contributor
        if (!note.contributors.includes(req.body.userId)) {
            note.contributors.push(req.body.userId);

            // Update the note's contributors array in the database
            await noteRepository.update(req.body.noteId, { contributors: note.contributors });

            // Add the note to the user's associateNotes list
            addAssociateNotes(req.body.userId, req.body.noteId);

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
        const associateNotes = await addAssociateNotes(req.body.userId, req.body.noteId)     //calling helper func
        res.json( {associateNotes} );
    } catch (error) {
        console.error('Failed to add Associate note:', error);
        res.status(500).json({ error: 'Failed to add Associate note' });
    }
})

app.patch('/removeAssociateNotes', async(req, res) => {
    try {
        const associateNotes = await removeAssociateNotes(req.body.userId, req.body.noteId)        //calling helper fun
        res.json( { associateNotes });
    } catch (error) {
        console.error('Failed to remove Associate note: ', error);
        res.status(500).json({ error: 'Failed to remove Associate note' });
    }
})


app.listen(port, async () => {
    console.log(`listening on http://localhost:${port}`);
    await connect();
    console.log('mongo Db connected');
});