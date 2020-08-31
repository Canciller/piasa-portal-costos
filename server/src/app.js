import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import httpLogger from './middleware/httpLogger';
import cors from 'cors';
import favicon from 'express-favicon';

import APIRoutes from './routes/api.routes';

require('dotenv').config();

var staticPath = '../../client/uimodule/build';

var app = express();

app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true, limit: '50mb',  parameterLimit: 50000 }));

app.use(httpLogger);

app.use(cors());
app.use(cookieParser());

app.use('/api/v1', APIRoutes);

app.use(favicon(path.join(__dirname, staticPath, 'resources/img/favicon.ico')));
app.use(express.static(path.join(__dirname, staticPath)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, staticPath, 'index.html'));
});

export default app;
