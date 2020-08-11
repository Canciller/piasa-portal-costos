import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import favicon from 'express-favicon';

var staticPath = '../../client/uimodule/build';

var app = express();

app.use(logger('dev'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(favicon(path.join(__dirname, staticPath, 'resources/img/favicon.ico')));
app.use(express.static(path.join(__dirname, staticPath)));

app.get('*', (req, res) => {
  console.log('test');
  res.sendFile(path.join(__dirname, staticPath, 'index.html'));
});

module.exports = app;
