//content,
//contributor : 'all user id'

import mongoose from "mongoose";
const { Schema } = mongoose;

const noteSchema = new mongoose.Schema({
    content: {
        type: String,

    },
    contributors: [{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
        }]
})

const Note = mongoose.model('Note', noteSchema);
export default Note;