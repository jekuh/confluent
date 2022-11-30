/**
 *  Langauge 
 */


// 1. Value, Types and Operations
let num1 = 1;
let num2 = 1;



switch (operation) {
    case value: "+"
   answer = num1 + num2;
        break;
        case value: "-"
   answer = num1 - num2;
        break;
    default: ""
        answer = "Please enter a validate operator !!!"
        break;
}
console.log(answer);




/**
 * Browser
 */



/**
 * Node
 */

// 1. MongDB CRUD  catalog/database (mbonteh, bloom, test) collections (users, accounts, transactions)

const userCreate   =  db.users.insert([{name: "Mbonteh", email:"mbonteh@mbonteh.com"}, {name: "Toumshi", email:"toumshi@mbonteh.com"}])
    
const userRead     = db.users.find({name:"Mbonteh"})
    
const userUpdate   = db.users.update({ name: "Mbonteh" }, { $set : { name: "Mbonteh II" }})
    
const userDelete   = db.user.deleteOne({name:"Mbonteh"})
    
