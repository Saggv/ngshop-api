import { expressjwt } from 'express-jwt';
import { JwtPayload, Jwt } from 'jsonwebtoken';
import { Request } from 'express';

export function authJwt(){
    const secret = process.env.SECRET_KEY || 'testet';
    return expressjwt({
        secret,
        algorithms: ["HS256"],
        isRevoked: isRevokedCallback 
    }).unless({
        path: [
            // {
            //     url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']
            // },
            {
                url: /\/products(.*)/, methods: ['GET', 'OPTIONS']
            },
            {
                url: /\/category(.*)/, methods: ['GET', 'OPTIONS']
            },
            '/user/login',
            '/user/register',
            '/products'

            // {
            //     url: /(.*)/
            // },
        ]
    });
};

async function isRevokedCallback (req: any, object: Jwt | undefined){
    console.log('d')
    if(!object){
        return true
    }

    const payload: JwtPayload = object.payload as JwtPayload;
    console.log(payload);
    req.auth = payload;
    if(payload.isAdmin){
       return false
    }

    return true
}

const jwt = require('jsonwebtoken');
 
export const verifyJWT = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    if(!authHeader){
        next();
        return;
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.SECRET_KEY,
        (err: any, decoded: any) => {
            req.auth = decoded;
            next();
        }
    );
}