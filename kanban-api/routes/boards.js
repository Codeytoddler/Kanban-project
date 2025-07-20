const express=require('express');
const router=express.Router();
const {getBoardView, createColumn}=require('../controllers/boardsController');

router.get('/:board_id', getBoardView);

router.post('/:board_id/columns', createColumn);

module.exports=router;