import * as path from 'path';

import express from 'express';
import { engine } from 'express-handlebars';

import { createIO } from './packets';
import { router as indexRouter } from './routes';

const app = express();

app.use('/', indexRouter);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (_req, res) => {
    res.render('home');
});

const ioServer = createIO(app);

ioServer.listen(3000, () => {
    console.log('listening on *:3000');
});

// app.listen(3000, () => {
//     console.log('server is running on port 3000');
// });
