import logger from '#config/logger.js';
import { getAllUsers, getUserById, updateUser, deleteUser } from '#services/users.service.js';
import { userIdSchema, updateUserSchema } from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error)
      });
    }

    const { id } = validationResult.data;
    
    logger.info(`Getting user by ID: ${id}`);

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${id} does not exist`
      });
    }

    res.json({
      message: 'Successfully retrieved user',
      user
    });
  } catch (e) {
    logger.error('Error fetching user by ID', e);
    next(e);
  }
};

export const editUser = async (req, res, next) => {
  try {
    // Validate ID parameter
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error)
      });
    }

    // Validate request body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error)
      });
    }

    const { id } = idValidation.data;
    const updates = bodyValidation.data;

    // Authorization checks
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    // Users can only update their own information
    if (requesterId !== id && requesterRole !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information'
      });
    }

    // Only admins can change roles
    if (updates.role && requesterRole !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can change user roles'
      });
    }

    logger.info(`Updating user ID: ${id}`, { requesterId, updates: Object.keys(updates) });

    const updatedUser = await updateUser(id, updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (e) {
    logger.error('Error updating user', e);
    
    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${req.params.id} does not exist`
      });
    }

    next(e);
  }
};

export const removeUser = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error)
      });
    }

    const { id } = validationResult.data;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    // Authorization checks - users can delete their own account or admins can delete any account
    if (requesterId !== id && requesterRole !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account'
      });
    }

    logger.info(`Deleting user ID: ${id}`, { requesterId });

    const deletedUser = await deleteUser(id);

    res.json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (e) {
    logger.error('Error deleting user', e);
    
    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${req.params.id} does not exist`
      });
    }

    next(e);
  }
};
