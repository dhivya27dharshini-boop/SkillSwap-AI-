const express=require('express');
const cors=require('cors');
const axios=require('axios');
const {pool,sign,auth,hash,verify}=require('./auth');
require('dotenv').config();

const app=express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/api/health',(req,res)=>res.json({ok:true,service:'SkillSwap API'}));

app.post('/api/auth/register',async(req,res)=>{
  try{
    const {name,email,password}=req.body;
    if(!name||!email||!password) return res.status(400).json({message:'All fields are required'});
    const [existing]=await pool.query('SELECT id FROM users WHERE email=?',[email]);
    if(existing.length) return res.status(409).json({message:'Email already registered'});
    const [r]=await pool.query('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)',[name,email,await hash(password)]);
    const user={id:r.insertId,name,email,role:'user'};
    res.json({token:sign(user),user});
  }catch(e){res.status(500).json({message:e.message});}
});

app.post('/api/auth/login',async(req,res)=>{
  try{
    const [rows]=await pool.query('SELECT * FROM users WHERE email=?',[req.body.email]);
    if(!rows.length || !(await verify(req.body.password,rows[0].password_hash))) return res.status(401).json({message:'Invalid email or password'});
    const u=rows[0]; res.json({token:sign(u),user:{id:u.id,name:u.name,email:u.email,role:u.role}});
  }catch(e){res.status(500).json({message:e.message});}
});

app.get('/api/me',auth,async(req,res)=>{
  const [rows]=await pool.query('SELECT id,name,email,bio,location,avatar_url,role,created_at FROM users WHERE id=?',[req.user.id]);
  res.json(rows[0]);
});

app.put('/api/me',auth,async(req,res)=>{
  const {name,bio,location,avatar_url}=req.body;
  await pool.query('UPDATE users SET name=?,bio=?,location=?,avatar_url=? WHERE id=?',[name,bio||'',location||'',avatar_url||'',req.user.id]);
  res.json({message:'Profile updated'});
});

app.get('/api/skills',auth,async(req,res)=>{
  const q=req.query.q||'';
  const [rows]=await pool.query(`SELECT s.*,u.name user_name,u.location FROM skills s JOIN users u ON u.id=s.user_id WHERE s.name LIKE ? ORDER BY s.created_at DESC`,[`%${q}%`]);
  res.json(rows);
});
app.get('/api/my-skills',auth,async(req,res)=>{
  const [rows]=await pool.query('SELECT * FROM skills WHERE user_id=? ORDER BY created_at DESC',[req.user.id]); res.json(rows);
});
app.post('/api/skills',auth,async(req,res)=>{
  const {name,category,level,type,description}=req.body;
  const [r]=await pool.query('INSERT INTO skills(user_id,name,category,level,type,description) VALUES(?,?,?,?,?,?)',[req.user.id,name,category,level,type,description||'']);
  res.json({id:r.insertId});
});
app.delete('/api/skills/:id',auth,async(req,res)=>{await pool.query('DELETE FROM skills WHERE id=? AND user_id=?',[req.params.id,req.user.id]);res.json({message:'Deleted'});});

app.get('/api/users/:id',auth,async(req,res)=>{
  const [[u]]=await pool.query('SELECT id,name,bio,location,avatar_url FROM users WHERE id=?',[req.params.id]);
  const [skills]=await pool.query('SELECT * FROM skills WHERE user_id=?',[req.params.id]);
  res.json({...u,skills});
});

app.post('/api/swaps',auth,async(req,res)=>{
  const {receiver_id,offered_skill_id,requested_skill_id,message}=req.body;
  const [r]=await pool.query('INSERT INTO swap_requests(sender_id,receiver_id,offered_skill_id,requested_skill_id,message) VALUES(?,?,?,?,?)',[req.user.id,receiver_id,offered_skill_id||null,requested_skill_id||null,message||'']);
  await pool.query('INSERT INTO notifications(user_id,title,message,type) VALUES(?,?,?,?)',[receiver_id,'New skill swap request','You received a new swap request.','swap']);
  res.json({id:r.insertId});
});
app.get('/api/swaps',auth,async(req,res)=>{
  const [rows]=await pool.query(`SELECT sr.*,s.name sender_name,r.name receiver_name FROM swap_requests sr JOIN users s ON s.id=sr.sender_id JOIN users r ON r.id=sr.receiver_id WHERE sr.sender_id=? OR sr.receiver_id=? ORDER BY sr.created_at DESC`,[req.user.id,req.user.id]);res.json(rows);
});
app.patch('/api/swaps/:id',auth,async(req,res)=>{
  const status=req.body.status;
  if(!['accepted','rejected','cancelled'].includes(status)) return res.status(400).json({message:'Invalid status'});
  await pool.query('UPDATE swap_requests SET status=? WHERE id=? AND receiver_id=?',[status,req.params.id,req.user.id]);
  res.json({message:'Request updated'});
});

app.get('/api/messages/:userId',auth,async(req,res)=>{
  const [rows]=await pool.query(`SELECT m.*,u.name sender_name FROM messages m JOIN users u ON u.id=m.sender_id WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?) ORDER BY m.created_at`,[req.user.id,req.params.userId,req.params.userId,req.user.id]);res.json(rows);
});
app.post('/api/messages',auth,async(req,res)=>{
  const {receiver_id,content}=req.body; const [r]=await pool.query('INSERT INTO messages(sender_id,receiver_id,content) VALUES(?,?,?)',[req.user.id,receiver_id,content]);res.json({id:r.insertId});
});

app.get('/api/notifications',auth,async(req,res)=>{const [rows]=await pool.query('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30',[req.user.id]);res.json(rows);});
app.patch('/api/notifications/:id/read',auth,async(req,res)=>{await pool.query('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',[req.params.id,req.user.id]);res.json({ok:true});});

app.post('/api/reviews',auth,async(req,res)=>{
  const {reviewee_id,rating,comment}=req.body;
  await pool.query('INSERT INTO reviews(reviewer_id,reviewee_id,rating,comment) VALUES(?,?,?,?)',[req.user.id,reviewee_id,rating,comment||'']);res.json({message:'Review added'});
});

app.get('/api/dashboard',auth,async(req,res)=>{
  const [[skills]] = await pool.query('SELECT COUNT(*) count FROM skills WHERE user_id=?',[req.user.id]);
  const [[sent]] = await pool.query('SELECT COUNT(*) count FROM swap_requests WHERE sender_id=?',[req.user.id]);
  const [[received]] = await pool.query('SELECT COUNT(*) count FROM swap_requests WHERE receiver_id=?',[req.user.id]);
  const [[unread]] = await pool.query('SELECT COUNT(*) count FROM notifications WHERE user_id=? AND is_read=0',[req.user.id]);
  res.json({skills:skills.count,sent:sent.count,received:received.count,unread:unread.count});
});

app.get('/api/recommendations',auth,async(req,res)=>{
  try{
    const [my]=await pool.query(`SELECT name,type,level,category FROM skills WHERE user_id=?`,[req.user.id]);
    const [others]=await pool.query(`SELECT s.id,s.name,s.type,s.level,s.category,s.description,u.id user_id,u.name user_name,u.location FROM skills s JOIN users u ON u.id=s.user_id WHERE s.user_id<>?`,[req.user.id]);
    const ai=await axios.post((process.env.AI_SERVICE_URL||'http://localhost:8000')+'/recommend',{my_skills:my,candidates:others},{timeout:2000});
    return res.json(ai.data);
  }catch(e){
    const [others]=await pool.query(`SELECT s.id,s.name,s.type,s.level,s.category,s.description,u.id user_id,u.name user_name,u.location FROM skills s JOIN users u ON u.id=s.user_id WHERE s.user_id<>? ORDER BY s.created_at DESC LIMIT 12`,[req.user.id]);
    return res.json(others.map(x=>({...x,score:75,reason:'Related skill/category match'})));
  }
});

app.get('/api/admin/stats',auth,async(req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({message:'Admin only'});
  const [[users]]=await pool.query('SELECT COUNT(*) count FROM users');
  const [[skills]]=await pool.query('SELECT COUNT(*) count FROM skills');
  const [[swaps]]=await pool.query('SELECT COUNT(*) count FROM swap_requests');
  const [[reports]]=await pool.query('SELECT COUNT(*) count FROM reports WHERE status="open"');
  res.json({users:users.count,skills:skills.count,swaps:swaps.count,reports:reports.count});
});

app.listen(process.env.PORT||5000,()=>console.log(`SkillSwap API running on ${process.env.PORT||5000}`));
