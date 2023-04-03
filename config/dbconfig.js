const mongodb = require('mongodb');
const mongoose = require('mongoose')
require('dotenv').config();

const dbUrl = process.env.DB_URL;

module.exports ={mongodb, dbUrl,mongoose}