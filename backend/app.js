const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv/config');

app.use(cors());
app.options('*', cors());

const api = process.env.API_URL;
const productRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');


//Middleware
app.use(express.json());
app.use(morgan('tiny'));

app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoriesRouter);

app.listen(3000, () => {
    console.log(api);
    console.log('Server is running http://localhost:3000')
});

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
    .then(() => {
        console.log('Database Connection is ready');
    })
    .catch((err) => {
        console.log(err);
    });
