
import {db} from "./database";


export function readAllLessons(req, res) {

    // REMEMBER:  Always a good idea for WEB APIs to return an object and hence the  {   } below. It should not directly return an array
    //            The object can of course have any shape ...it could be an array of other objects .... etc.
    //            In the example below, db.readAllLessons() returns an array so basically 
    //            here we are returning  { lessons:  [ ... ]   }
    res.status(200).json( { lessons:db.readAllLessons() } );

}
