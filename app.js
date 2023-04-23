require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

async function main () {
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true
     }
     
     try {
      await mongoose.connect("mongodb://127.0.0.1:27017/userDB", connectionOptions);
      console.log(`Connected to MongoDB`)
     } catch (err) {
      console.log(`Couldn't connect: ${err}`)
     }
  }
  
  main();
  
  const userSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique : true
      },
      password: {
        type: String,
        required: true,
      }
    })
    

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
const User = mongoose.model('Users', userSchema);
  
async function findO(RequestedObj)
{
    const result = await User.findOne(
        {
            email: RequestedObj.email,
        });
    console.log(result);
    if (result !== null)
        return result;
    else 
        return null
}


//Express JS

const RegRsponse = [
    {
        Title:'Uh oh!',
        Message:'There was a problem in signing you up. Please try again or contact the developer',
        BtnMsg:'Try Again'
    },
    {
        Title: 'Awesome !!',
        Message: "You've been Successfully signed up to our Newsletter, look forward to lots of awesome content",
        BtnMsg: 'Login !!'
    }
]
const logResponse = [{
    Title:'Uh oh!',
    Message:'There was a problem in login you up. Please try again or contact the developer',
    BtnMsg:'Login Again'
}]

app.get('/', function (req, res) {
    res.render('home');
});


app.route('/login')
    
    .get( function (req, res) {
    res.render('login');
    })
    .post(function (req, res) {

        const RequestedObj = {
            email: req.body.username,
            password: req.body.password
        }
        findO(RequestedObj).then((result) => {
            console.log(result);
            if (result !== null && result.password==RequestedObj.password)
                res.render('secrets');
            else
                res.render('Response1', { Obj: logResponse[0] });
        }).catch((err)=>{
            console.log(err);
            res.render('Response1',{Obj: logResponse[0]})
        })
    
})

app.route('/register')
    
    .get(function (req, res) {
        res.render('register');
    })
    .post(function (req, res) {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        })
        newUser.save().then((newUser) => {
            res.render('Response1', { Obj: RegRsponse[1] })
        }).catch((err)=>{
            console.log(err);
            res.render('Response1', { Obj: RegRsponse[0] });
        });

    });



app.post('/Response1', function (req, res) {
    const BtnMsg = req.body.BtnMsg;
    if (BtnMsg == RegRsponse[0].BtnMsg)
        res.redirect('/register');
    else
        res.redirect('/login');
});


app.listen(3000, function () { console.log("Server started on 3000") });
