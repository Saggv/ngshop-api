import { expressjwt } from 'express-jwt';
import { JwtPayload, Jwt } from 'jsonwebtoken';
import { Request } from 'express';

function authJwt(){
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
            // {
            //     url: /\/products(.*)/, methods: ['GET', 'OPTIONS']
            // },
            // {
            //     url: /\/category(.*)/, methods: ['GET', 'OPTIONS']
            // },
            // '/user/login',
            // '/user/register'

            {
                url: /(.*)/
            },
        ]
    });
};

async function isRevokedCallback (req: Request, object: Jwt | undefined){
    if(!object){
        return true
    }

    const payload: JwtPayload = object.payload as JwtPayload;
    if(payload.isAdmin){
       return false
    }

    return true
}

export default authJwt;