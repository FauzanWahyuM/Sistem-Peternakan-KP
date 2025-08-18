import { staticUsers, findUserByUsername, findUserByEmail, findUserById, addUser } from '../lib/static-users';

export class UserModel {
  static async create(userData) {
    try {
      const user = addUser(userData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    return findUserByUsername(username);
  }

  static async findByEmail(email) {
    return findUserByEmail(email);
  }

  static async findById(id) {
    return findUserById(id);
  }

  static async updateById(id, updateData) {
    // In static implementation, we'll just return true to indicate success
    // since we're not actually updating anything
    console.log(`Update request for user ${id} with data:`, updateData);
    return true;
  }

  static async updateLastLogin(id) {
    // In static implementation, we'll just return true to indicate success
    console.log(`Update last login for user ${id}`);
    return true;
  }

  static async deleteById(id) {
    // In static implementation, we'll just return true to indicate success
    // since we're not actually deleting anything
    console.log(`Delete request for user ${id}`);
    return true;
  }

  static async findAll() {
    return staticUsers;
  }

  static async findByRole(role) {
    return staticUsers.filter(user => user.role === role);
  }
}