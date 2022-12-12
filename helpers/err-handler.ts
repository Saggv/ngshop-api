import { Request, Errback, Response, NextFunction } from 'express';
 
function errorHandler(err: Errback, req: Request, res: Response, next: NextFunction){
    if(err.name === 'UnauthorizedError'){
        return res.status(401).json({message: 'The user is not authorized'})
    }

    if(err.name === 'ValidationoError'){
        return res.status(401).json({message: err})
    }

    return res.status(500).json(err);
};

export default errorHandler;