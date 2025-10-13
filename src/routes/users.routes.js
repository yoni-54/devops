import express from 'express';
import { fetchAllUsers, fetchUserById, editUser, removeUser } from '#controllers/users.controller.js';
import { authenticateToken, requireAdmin } from '#middleware/auth.middleware.js';

const router = express.Router();

// Get all users - requires authentication and admin role
router.get('/', authenticateToken, requireAdmin, fetchAllUsers);

// Get user by ID - requires authentication
router.get('/:id', authenticateToken, fetchUserById);

// Update user - requires authentication, users can update themselves, admins can update anyone
router.put('/:id', authenticateToken, editUser);

// Delete user - requires authentication, users can delete themselves, admins can delete anyone
router.delete('/:id', authenticateToken, removeUser);

export default router;

