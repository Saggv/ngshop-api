import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ROLES, verifyRoles } from '../helpers/verifyRoles';
import {verifyJWT} from '../helpers/jwt';

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
       return res.status(500).send({message: 'List user not found!'}); 
    }

    res.send(listUser);
});


router.get('/:id', async(req, res) =>{
    const user = await User.findById(req.params.id).select('-password');
    if(!user){
       return res.status(500).send({message: 'Can not find the user'}); 
    }

    res.send(user);
})

router.post('/login', async(req, res) =>{
    const user = await User.findOne({email: req.body.email});
    if(!user){
       return res.status(400).send({message: 'The user not found!'});
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

router.post('/register',verifyJWT,  async(req: any , res: Response) =>{
    const isExistedEmail = await User.findOne({email: req.body.email});
    if(isExistedEmail){
       return res.status(400).send({message: 'Email is existed!'});
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

    const roles: string[] = [ROLES.Admin, ROLES.Manager];

    if(roles.includes(role) && !req.auth || req.auth.role != ROLES.Admin){
        res.status(401).send({message: 'Unauthorized'});
        return 
    }

    try{
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
           return res.status(500).send({message: 'Can not crate user!'})
        }
    
        res.status(201).send({...user, password: ''});
    }catch(err: any){
        res.status(500).send({message: err})
    }
});

router.put('/:id', verifyRoles([ROLES.Admin, ROLES.Manager]), async(req: any , res: Response) =>{
    const userExist = await User.findById(req.params.id);
    const role = userExist?.role || '';
    const roles: string[] = [ROLES.Admin, ROLES.Manager];
    if(req.auth.role === ROLES.Manager && roles.includes(role)){
       res.status(401).send({message: 'Unauthorized'});
       return 
    }

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
       return res.status(500).send({message: 'Can not update the user'})
    }

    res.status(201).send(user);
});

router.delete('/:id',verifyRoles([ROLES.Admin, ROLES.Manager]), async(req: any, res) => {
    const isUserId = mongoose.isValidObjectId(req.params.id);
    if(!isUserId){
        res.status(400).send({message: 'User ID is invalid!'});
        return;
    }

    const userExist = await User.findById(req.params.id);
    const role = userExist?.role || '';
    const roles: string[] = [ROLES.Admin, ROLES.Manager];
    if(req.auth.role === ROLES.Manager && roles.includes(role)){
       res.status(401).send({message: 'Unauthorized'});
       return 
    }

    const user = await User.findByIdAndRemove(req.params.id);
    if(!user){
        res.status(400).send({message: 'Delete the user was failed!'});
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