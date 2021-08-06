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



function checkVertical (board){
    y = pos[coords][1]
    let checkDuplicates = new Set();

    for(i=0; i <= board[0].length - 6; i++){
      checkDuplicates.add(board[i][y]);
      checkDuplicates.add(board[i+1][y]);
      checkDuplicates.add(board[i+2][y]);
      checkDuplicates.add(board[i+3][y]);
      checkDuplicates.add(board[i+4][y]);
      if (checkDuplicates.size==1){
        return true;
      }
      checkDuplicates.clear();
    }
    return false;
}

function checkHorizontal (board) {
    x = pos[coords][0]
    let checkDuplicates = new Set();

    checkDuplicates.add(board[x][0]);
    for(i=1; i <= board[0].length - 6; i++){
      checkDuplicates.add(board[x][i]);
      checkDuplicates.add(board[x][i+1]);
      checkDuplicates.add(board[x][i+2]);
      checkDuplicates.add(board[x][i+3]);
      checkDuplicates.add(board[x][i+4]);
      if (checkDuplicates.size==1){
        return true;
      }
      checkDuplicates.clear();
    }
    return false;
}

function checkDiagLeftRight (board) {
    x = board[0].length-5
    currX = board[0].length-7
    y = 0
    
    let checkDuplicates = new Set();
  
    while (!(x == 0) || !(y == board[0].length - 5)){
      checkDuplicates.add(board[x][y]);
      checkDuplicates.add(board[x+1][y+1]);
      checkDuplicates.add(board[x+2][y+2]);
      checkDuplicates.add(board[x+3][y+3]);
      checkDuplicates.add(board[x+4][y+4]);
      console.log(checkDuplicates)
      if (checkDuplicates.size==1){
        return true;
      }
      if (x == board[0].length - 5 || y == board[0].length - 5){
        if (currX > 0){
          x = currX
          y = 0
        }else{
          x = 0
          y = Math.abs(currX);
        }
        currX -= 1
      }else{
        x += 1
        y += 1
      }
      checkDuplicates.clear();
    }
    return false;
}

function checkDiagRightLeft (board){

    x = board[0].length-5
    currX = board[0].length-7
    y = board[0].length -1

    let checkDuplicates = new Set();
    while (!(x == 0) || !(y == 4)){
    checkDuplicates.add(board[x][y]);
    checkDuplicates.add(board[x+1][y-1]);
    checkDuplicates.add(board[x+2][y-2]);
    checkDuplicates.add(board[x+3][y-3]);
    checkDuplicates.add(board[x+4][y-4]);
    if (checkDuplicates.size==1){
        return true;
    }
    if (x == board[0].length - 5 || y == 4){
        if (currX > 0){
        x = currX
        y = board[0].length -1
        }else{
        x = 0
        y = board[0].length -1 + currX
        }
        currX -= 1
    }else{
        x += 1
        y -= 1
    }
    checkDuplicates.clear();
}
return false;
}






app.use(express.static('public_html'))
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
