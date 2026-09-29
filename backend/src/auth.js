const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

function sign(user){ return jwt.sign({id:user.id, role:user.role}, process.env.JWT_SECRET || 'dev-secret', {expiresIn:'7d'}); }
function auth(req,res,next){
  try {
    const token=(req.headers.authorization||'').replace('Bearer ','');
    req.user=jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    next();
  } catch(e){ return res.status(401).json({message:'Authentication required'}); }
}
async function hash(password){ return bcrypt.hash(password,10); }
async function verify(password,hashValue){ return bcrypt.compare(password,hashValue); }
module.exports={sign,auth,hash,verify,pool};