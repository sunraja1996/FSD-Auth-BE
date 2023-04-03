const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SALTROUNDS = process.env.SALTROUNDS;
const secretkey = process.env.secretkey;


const hashPassword = async(password)=>{
    let salt = await bcrypt.genSalt(parseInt(SALTROUNDS));
    return await bcrypt.hash(password, salt)
}

const hashCompare = async(password, hashedPassword)=>{
    return await bcrypt.compare(password, hashedPassword)
}

const createToken = async({email, role,firstName, lastName}) =>{
    let token = await jwt.sign(
        {email, role, firstName, lastName},secretkey, {expiresIn:'1d'}
    )
    return token
}
const decodeToken = async(token)=>{ 
    return await jwt.decode(token)
}

//middlewares
const validate = async(req, res, next)=>{
    console.log(req.headers, req.headers.authorization);
    if(req.headers && req.headers.authorization)
    {
        let token = req.headers.authorization.split(" ")[1]

        let decode = await decodeToken(token)

        console.log(decode);

        req.body.email=decode.email

        if((Math.round(Date.now()/1000)) <= decode.exp)

            next()
        else
            res.send({statusCode:400, message : "Token Expired"})
    } else
    res.send({statusCode:400, message : "Token Missing"})

}

const roleAdmin = async(req, res, next)=>{
    if(req.headers && req.headers.authorization)
    {
        let token = req.headers.authorization.split(" ")[1]

        let decode = await decodeToken(token)

        if(decode.role === 'admin')

            next()
            
        else
            res.send({statusCode:400, message : "Only Admin can Access"})

    } 
    else
    res.send({statusCode:400, message : "Token Missing"})

}


const roleUser = async(req, res, next)=>{
    if(req.headers && req.headers.authorization)
    {
        let token = req.headers.authorization.split(" ")[1]

        let decode = await decodeToken(token)

        if(decode.role === 'user') {
            next()
        } else {
            res.send({statusCode:400, message : "Only User can Access"})
        }

    } 
    else {
        res.send({statusCode:400, message : "Token Missing"})
    }
}




module.exports = {hashPassword, hashCompare, createToken, decodeToken, validate, roleAdmin, roleUser}