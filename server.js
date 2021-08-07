/*
 * Author: Chen Song, Adnan
 * Date  : 2021/08/06
 * Purpose: This is the backend part of web application Gomoku, a simple chess game
 */
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
const RoomSchema = new Schema({
        name: String,
        password: String,
        playerBlack: Schema.Types.ObjectId,
        playerWhite: Schema.Types.ObjectId,
        next: String,
        lastMove: [{type: String}],
})
// Models
const Session = mongoose.model('Session', SessionSchema)
const Account = mongoose.model('Account', AccountSchema)
const User    = mongoose.model('User'   , UserSchema   )
const Room    = mongoose.model('Room'   , RoomSchema   )

/*************************
 *    Express Routes     *
 *************************/
const app = express()
app.use(express.json())
app.use(cookieParser())
// ========= CONST ========== //
const port = 80
const iterations = 1000
const cookieExpire = 30 * 60 * 1000;
const MSG = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    FULL: 'The room is Full'
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
// hash the password then run the callback function
function hashPass(password, salt, cb){
    if(!salt){
        salt = crypto.randomBytes(64).toString('base64')
    }
    crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, hash) =>{
        if (err) throw err
        cb(salt, hash.toString('hex'))
    })
}

// this route is used to add a new user
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

// This route handles login request
// It will set the cookie after verification
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
                res.cookie("login", genSession(username), {maxAge: cookieExpire})
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
app.get('/', (req, res)=>{
    res.redirect('/index.html')
})
app.get('/index.html', (req, res)=>{
    // check if session is valid
    const session = req.cookies.login
    if(!session){
         res.sendFile('public_html/index.html', { root: '.' })
    } else {
        Session.findById(ObjectId(session._id))
            .then((result)=>{
                if(result == null){
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
         res.redirect('/index.html')
    } else {
        Session.findById(ObjectId(session._id))
            .then((result)=>{
                if(result == null){ 
                    res.redirect('/index.html')
                    
                } else {
                    res.sendFile('public_html/lobby.html', { root: '.' })
                }
            })
    }
})

app.use(express.static('public_html'))
// ====== Game Related Routes ======//
app.get('/game/:roomId', (req, res)=>{
    const session = req.cookies.login
    if(!session){
         res.redirect('/index.html')
    } else {
        Session.findById(ObjectId(session._id))
        .then((result)=>{
            if(result == null){
                res.redirect('/index.html')
                
            } else {
                res.sendFile('public_html/game.html', { root: '.' })
            }
        })
    }
})

// return a list of room documents
app.get('/rooms', (req, res)=>{
    Room.find({})
    .then((results)=>{
        res.json(results)
    })
})

// send back the current username
app.get('/get/curruser', (req, res)=>{
    const session = req.cookies.login
    if(!session){
        res.redirect('/index.html')
    }
    res.send(session.username)
})

// this route is for user to make a move
app.post('/makemove/', (req, res)=>{
    const move = req.body.move
    const roomId = req.body.roomId
    Room.findById(roomId)
    .then((result)=>{
        result.lastMove = move
        if(result.next == 'Black'){
            result.next = 'White'
        } else {
            result.next = 'Black'
        }
        result.save(errHandler)
        res.send(MSG.SUCCESS)
    })
    
})
// get the user by id
app.post('/get/user/', (req, res)=>{
    let userId = req.body.userId
    User.findById(ObjectId(userId))
    .then((result)=>{
        res.json(result)
    })
})
// get the room by id
app.post('/get/room/', (req, res)=>{
    let roomId = req.body.roomId
    if(roomId[0] == '\'' || roomId == '\"'){
        roomId = roomId.substring(1, roomId.length - 1)
    }
    Room.findById(ObjectId(roomId))
    .then((result)=>{
        res.json(result)
    })
})
// create a room
app.post("/create/", (req, res)=>{
    // check if session is valid
    const session = req.cookies.login
    const lobbyName = req.body['lobbyName']
    const isPrivate = req.body['isPrivate']
    const password = req.body['password']
    const color = req.body['color']
    if(!session){
        res.redirect('/index.html')
        return
    }
    Session.findById(ObjectId(session._id))
    .then((result)=>{
        if(result == null){
            res.redirect('/index.html')
            throw new Error('Session has expired.')
        }
        // get current userid
        return result
    })
    .then((result)=>{
        return User.find({username: result.username}).exec()
    }, errHandler)
    .then((results)=>{
        if(results.length == 0){
            res.send(MSG.ERROR)
            throw new Error('User not found')
        }
        const user = results[0]
        var passwordTemp, playerBlackTemp, playerWhiteTemp
        if(isPrivate){
            passwordTemp = password
        } else {
            passwordTemp = null
        }
        if(color == 'black'){
            playerBlackTemp = user._id
            playerWhiteTemp = null
        } else {
            playerBlackTemp = null
            playerWhiteTemp = user._id
        }
        const newRoom = Room({
            name: lobbyName,
            password: passwordTemp,
            playerBlack: playerBlackTemp,
            playerWhite: playerWhiteTemp,
            next: 'Black'
        })
        newRoom.save(errHandler)
        res.json({
            id: newRoom._id
        })
    }, errHandler)
    .catch(errHandler)

})
// join a room
app.post('/join/:roomId', (req, res)=>{
    const session = req.cookies.login
    let roomId = req.params.roomId
    if(!session){
        res.redirect('/index.html')
        return
    }
    Session.findById(ObjectId(session._id))
    .then((result)=>{
        if(result == null){
            res.redirect('/index.html')
            throw new Error('Session has expired.')
        }
        // get current userid
        return result
    })
    .then((result)=>{
        return User.find({username: result.username}).exec()
    }, errHandler)
    .then((results)=>{
        let user = results[0]
        Room.find({_id: roomId})
        .then((results)=>{
            let room = results[0]
            if(room.playerBlack == null){
                room.playerBlack = user._id
                room.save(errHandler)
                res.send(MSG.SUCCESS)
            } else if(room.playerWhite == null){
                room.playerWhite = user._id
                room.save(errHandler)
                res.send(MSG.SUCCESS)
            } else {
                res.send('The room is fall')
                return
            }
        })
    }, errHandler)
    
})

// ====== Game Related Routes Ends======//
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
