import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ROLES, verifyRoles } from '../helpers/verifyRoles';

import User from '../models/user';

const router = Router();

router.get('/', verifyRoles([ROLES.Admin, ROLES.Manager]), async(req: any, res) =>{
    let filter = {};

    if (req.auth.role === ROLES.Manager) {
      filter = {
        role: [ROLES.Manager, ROLES.User],
      };
    }

    const listUser = await User.find(filter).sort({createdAt: -1});
    if(!listUser){
       return res.status(400).send('Can not list the users1'); 
    }

    res.send(listUser);
});


router.get('/:id', async(req, res) =>{
    const user = await User.findById(req.params.id).select('-password');
    if(!user){
       return res.status(400).send('Can not list the users1'); 
    }

    res.send(user);
})

router.post('/login', async(req, res) =>{
    const user = await User.findOne({email: req.body.email});
    if(!user){
       return res.status(400).send('The user not found!');
    }

    if(user?.password && bcryptjs.compareSync(req.body.password, user?.password)){
        const secretKey: string = process.env.SECRET_KEY || 'asdfasdfs';
        const token = jwt.sign({
            id: user.id,
            role: user.role
        }, 
        secretKey,
        {expiresIn: '1d'});
        
        res.send({token, id: user.id})
    }else{
        res.status(400).send({success: false, messge: 'Password incorrect'})
    }
})

router.post('/register',  async(req: Request , res: Response) =>{
    const isExistedEmail = await User.findOne({email: req.body.email});
    if(isExistedEmail){
       return res.status(400).send('Email is existed!');
    }

    const {
        name,
        email,
        phone,
        password,
        ward,
        district,
        city,
        zip,
        country,
        isAdmin,
        role,
    } = req.body; 

    const user = await new User({
        name,
        email,
        phone,
        ward,
        district,
        city,
        zip,
        country,
        isAdmin,
        role,
        password: bcryptjs.hashSync(password, 10)
    }).save();

    if(!user){
       return res.status(500).send('Can not crate user!')
    }

    res.status(201).send({...user, password: ''});
});

router.put('/:id',  async(req: Request , res: Response) =>{
    const userExist = await User.findById(req.params.id);
    let password;
    if(!userExist){
        password = bcryptjs.hashSync(req.body.password, 10);
    }else{
        password = userExist.password;
    }

    const {
        name,
        email,
        phone,
        ward,
        district,
        city,
        zip,
        country,
        isAdmin
    } = req.body; 

    const user = await User.findByIdAndUpdate(req.params.id, {
        name,
        email,
        phone,
        password,
        ward,
        district,
        city,
        zip,
        country,
        isAdmin
    }, {new: true})

    if(!user){
       return res.status(500).send('Can not update the user')
    }

    res.status(201).send(user);
});

router.delete('/:id', async(req, res) => {
    const isUserId = mongoose.isValidObjectId(req.params.id);
    if(!isUserId){
        res.status(500).send('User ID is invalid!');
        return;
    }

    const user = await User.findByIdAndRemove(req.params.id);
    if(!user){
        res.status(400).send('Delete the user was failed!');
    }

    res.status(200).send({success: true, message: 'Delete user is successfully!'})
})

router.get('/get/count', async(req, res) =>{
    const count = await User.countDocuments();
    if(!count){
       return res.status(400).send({success: false}); 
    }

    res.send({count});
});

export default router;