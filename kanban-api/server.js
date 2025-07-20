const express=require('express');
const app=express();
require('dotenv').config();

app.use(express.json());

app.use('/boards', require('./routes/boards'));
app.use('/columns', require('./routes/columns'));
app.use('./tasks', require('./routes/tasks'));

const PORT=process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log('Server is running.');
});