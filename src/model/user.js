//associateNotes: An array that will hold references to all the notes a user has created or contributes to

import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    associateNotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
    //    required: true,
    }],
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;