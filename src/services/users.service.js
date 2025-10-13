import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id));

    return result[0] || null;
  } catch (e) {
    logger.error('Error getting user by ID', e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Update the user with timestamp
    const updatedData = {
      ...updates,
      updated_at: new Date(),
    };

    const result = await db
      .update(users)
      .set(updatedData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    return result[0];
  } catch (e) {
    logger.error('Error updating user', e);
    throw e;
  }
};

export const deleteUser = async id => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const result = await db.delete(users).where(eq(users.id, id)).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    });

    return result[0];
  } catch (e) {
    logger.error('Error deleting user', e);
    throw e;
  }
};
