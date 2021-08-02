const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const app = express()
const port = 3000
/*************************
 *    MongoDB settings   *
 *************************/
const databaseURL = 'mongodb://localhost:27017/gomoku';
mongoose.connect(databaseURL, {useNewUrlParser: true, useUnifiedTopology:true});
// Schemas
const Schema = mongoose.Schema
const User = new Schema(
    {
        Username: String,
        Password: String,
        Status: String,
        Room: Schema.Types.ObjectId
    }
);


/*************************
 *    Express Routes     *
 *************************/
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})