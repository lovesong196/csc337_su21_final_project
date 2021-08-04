const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
/*************************
 *    MongoDB settings   *
 *************************/
const databaseURL = 'mongodb://localhost:27017/gomoku'
mongoose.connect(databaseURL, {useNewUrlParser: true, useUnifiedTopology:true})
// Schemas
const Schema = mongoose.Schema
const SessionSchema = new Schema({
        username: String, 
        expire: Number
})
const AccountSchema = new Schema({
        salt: String,
        hash: String
})
const UserSchema = new Schema({
        username: String,
        account: Schema.Types.ObjectId,
        status: String,
        room: Schema.Types.ObjectId
})
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
// ========= CONST ========== //
const port = 3000
const iterations = 1000
const cookieExpire = 30 * 60 * 1000;
const MSG = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
}
// ======= CONST ENDS ======= //
// ==== UTILITY FUNCTIONS === //
function errHandler(err){
    if(err) {
        console.log(err)
    }
}
function ObjectId(id){
    return mongoose.Types.ObjectId(id)
}
// = UTILITY FUNCTIONS ENDS = //
// ========= LOGIN ========== //
function genSession(username){
    const newSession = Session({
        username: username,
        expire: Date.now() + cookieExpire
    })
    newSession.save(errHandler)
    return newSession
}
function hashPass(password, salt, cb){
    if(!salt){
        salt = crypto.randomBytes(64).toString('base64')
    }
    crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, hash) =>{
        if (err) throw err
        cb(salt, hash.toString('hex'))
    })
}

app.post('/add/user', (req, res)=>{
    const username = req.body['username']
    const password = req.body['password']
    User.find({username: username})
    .then((results)=>{
        if(results.length != 0){
            res.send(MSG.ERROR)
            return Promise.reject(`The username "${username}" has been taken`)
        }
    })
    .then(()=>{
        hashPass(password, null, (salt, hash)=>{
            let newAccount = Account({ 
                salt: salt,
                hash: hash
            })
            let newUser = User({
                username: username,
                account: newAccount._id,
                status: 'Free',
                room: null
            })
            newAccount.save(errHandler)
            newUser.save(errHandler)
            res.send(MSG.SUCCESS)
        })
    }, errHandler)
    .catch(errHandler)
})

app.post("/login/", (req, res)=>{
    var username = req.body['username']
    var password = req.body['password']
    User.find({username: username})
    .then((results)=>{
        if(results.length == 0){
            res.send(MSG.ERROR)
            return Promise.reject(`User "${username}" does not exist.`)
        }
        return results[0]
    })
    .then((result)=>{
        const accountId = result.account
        return Account.findById(ObjectId(accountId))
    }, errHandler)
    .then((account) => {
        hashPass(password, account.salt, (salt, hash)=>{
            if(hash == account.hash){
                res.cookie("login", genSession(), {maxAge: cookieExpire})
                res.send(MSG.SUCCESS)
            } else {
                res.send(MSG.ERROR)
            }
        })
    }, errHandler)
    .catch(errHandler)
})
// remove outdated sessions every 10 seconds
setInterval(()=>{
    Session.find({})
    .then((results)=>{
        const now = Date.now()
        for(session of results){
            if(session.expire < now){
                session.remove()
            }
        }
    })
}, 10 * 1000)
// ========= LOGIN ENDS ===== //
app.get('/index.html', (req, res)=>{
    // check if session is valid
    const session = req.cookies.login
    if(!session){
         res.sendFile('public_html/index.html', { root: '.' })
    } else {
        Session.findById(ObjectId(session._id))
            .then((results)=>{
                if(results.length == 0){
                    res.sendFile('public_html/index.html', { root: '.' })
                } else {
                    res.redirect('/lobby.html')
                }
            })
    }
})
app.get('/lobby.html', (req, res)=>{
    const session = req.cookies.login
    if(!session){
         res.redirect('index.html')
    } else {
        Session.findById(ObjectId(session._id))
            .then((results)=>{
                if(results.length == 0){
                    res.redirect('index.html')
                    
                } else {
                    res.sendFile('public_html/lobby.html', { root: '.' })
                }
            })
    }
})
app.get('/game.html', (req, res)=>{
    const session = req.cookies.login
    if(!session){
         res.redirect('index.html')
    } else {
        Session.findById(ObjectId(session._id))
            .then((results)=>{
                if(results.length == 0){
                    res.redirect('index.html')
                    
                } else {
                    res.sendFile('public_html/game.html', { root: '.' })
                }
            })
    }
})
app.use(express.static('public_html'))
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})