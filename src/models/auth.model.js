const db = require("../../config/db");

const Auth = {
  // Find user by email for login
  async findByEmail(email) {
    const [rows] = await db.execute(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.password_hash,
        u.role,
        u.depot_id,
        d.name AS depot_name,
        u.status,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN depots d
        ON u.depot_id = d.id
      WHERE u.email = ?
      LIMIT 1
      `,
      [email]
    );

    return rows[0];
  },

  // Find user by ID
  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.depot_id,
        d.name AS depot_name,
        u.status,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN depots d
        ON u.depot_id = d.id
      WHERE u.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0];
  },

  // Check whether an email already exists
  async emailExists(email) {
    const [rows] = await db.execute(
      `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    return rows.length > 0;
  },

  // Create a new authentication user
  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO users
      (
        name,
        email,
        password_hash,
        role,
        depot_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        data.name,
        data.email,
        data.password_hash,
        data.role || "OPERATIONAL_STAFF",
        data.depot_id || null,
        data.status || "ACTIVE",
      ]
    );

    return result.insertId;
  },

  // Update password
  async updatePassword(id, passwordHash) {
    const [result] = await db.execute(
      `
      UPDATE users
      SET
        password_hash = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [passwordHash, id]
    );

    return result.affectedRows;
  },

  // Change account status
  async updateStatus(id, status) {
    const [result] = await db.execute(
      `
      UPDATE users
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [status, id]
    );

    return result.affectedRows;
  },

  // Get complete user information after login
  async getAuthenticatedUser(id) {
    const [rows] = await db.execute(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.depot_id,
        d.name AS depot_name,
        d.location AS depot_location,
        u.status,
        u.created_at
      FROM users u
      LEFT JOIN depots d
        ON u.depot_id = d.id
      WHERE u.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0];
  },
};

module.exports = Auth;