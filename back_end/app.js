const express = require('express');
const dotenv = require('dotenv');
const  connectDB = require('./config/db');
const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const path = require('path');
// elements de test
const bodpar = require('body-parser');
// element de test



//environment variables loading
dotenv.config({path: './config/config.env'});

// connexion à la base de données
connectDB();

const app = express();

app.use((req,res,next)=>{
    res.set('Access-Control-Allow-Origin','*');
    res.set('Access-Control-Allow-Headers','Origin, X-Requested-With,Content, Accept,Content-Type,Authorization');
    res.set('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,PATCH,OPTIONS');
    next();
}); 
app.options('/*',(__, res) => {
    res.sendStatus(200);
});
app.use(express.json()); 
//element de test
app.use(bodpar.urlencoded({extended:true}));
//element de test
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use("/images", express.static(path.join(__dirname,'images')));








module.exports = app;