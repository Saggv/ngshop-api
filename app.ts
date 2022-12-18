import express, { Express } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';

import productRouter from './routers/products';
import categoryRouter from './routers/categories';
import userRouter from './routers/user';
import orderRouter from './routers/order';

import {authJwt} from './helpers/jwt';
import errorHandler from './helpers/err-handler';


const app: Express = express();
dotenv.config();

const port = process.env.PORT;
const mongooseUri: string = process.env.MONGOOSE_URL || '';

app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());
app.use('/public/uploads', express.static('public/uploads'));

app.use(authJwt());
app.use(errorHandler)

app.use('/products', productRouter);
app.use('/category', categoryRouter);
app.use('/user', userRouter);
app.use('/order', orderRouter);

mongoose.connect('mongodb://localhost:27017/shop').then(() => {
    console.log('Connect to mongoose successfully!')
}).catch(err =>{
    console.log('Conntect to mongoose error!', err);
});

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});