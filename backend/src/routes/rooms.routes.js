import { Router } from 'express';
import * as roomsController from '../controllers/rooms.controller.js';

const router = Router();

router.get('/', roomsController.getRooms);
router.post('/', roomsController.createRoom);
router.post('/join', roomsController.joinRoom);
router.post('/:id/leave', roomsController.leaveRoom);

export default router;
