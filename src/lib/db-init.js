// This file is kept for compatibility but no longer needed for static implementation
export async function initializeDatabase() {
  console.log('Database initialization skipped for static implementation');
}

export async function createDefaultAdminUser() {
  console.log('Default admin user creation skipped for static implementation');
  console.log('Using static users defined in src/lib/static-users.js');
}