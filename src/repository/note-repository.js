import Note from "../model/note.js";

import CrudRepository from "./crud-repository.js";

class NoteRepository extends  CrudRepository{
    constructor(){
        super(Note);
    }
}


export default NoteRepository;
