const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
/*************************
 *    MongoDB settings   *
 *************************/
const databaseURL = 'mongodb://localhost:27017/gomoku';
mongoose.connect(databaseURL, {useNewUrlParser: true, useUnifiedTopology:true});
// Schemas
const Schema = mongoose.Schema
const SessionSchema = new Schema(
    {
        username: String, 
        expire: Number
    }
)
const AccountSchema = new Schema(
    {
        username: String,
        salt: String,
        hash: String
    }
)
const UserSchema = new Schema(
    {
        account: Schema.Types.ObjectId,
        status: String,
        room: Schema.Types.ObjectId
    }
);
// Models
const Session = mongoose.model('Session', SessionSchema)
const Account = mongoose.model('Account', AccountSchema)
const User    = mongoose.model('User'   , UserSchema   )

/*************************
 *    Express Routes     *
 *************************/
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.static("public_html"))
// ========= CONST ========== //
const port = 3000
const MSG = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
}
// ======= CONST ENDS ======= //
// ==== UTILITY FUNCTIONS === //
function errHandler(err){
    if(err) {
        console.log(error)
    }
}
// = UTILITY FUNCTIONS ENDS = //
// ========= LOGIN ========== //
function hashPass(password, cb){
    const salt = crypto.randomBytes(64).toString('base64')
    const iterations = 1000
    crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, hash) =>{
        if (err) throw err
        console.log(salt, hash)
        cb(salt, hash)
    })
}

app.post('/add/user', (req, res)=>{
    const username = req.body["username"]
    const password = req.body["password"]
    hashPass(password, (salt, hash)=>{
        let newAccount = Account({
            username: username,
            salt: salt,
            hash: hash
        })
        let newUser = User({
            account: newAccount._id,
            status: "Free",
            room: null
        })
        newAccount.save(errHandler)
        newUser.save(errHandler)

    })
})


// ========= LOGIN ENDS ===== //
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})