const db = require("../../config/db");

const User = {
  async findAll() {
    const [rows] = await db.execute(`
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
      LEFT JOIN depots d ON u.depot_id = d.id
      ORDER BY u.id DESC
    `);

    return rows;
  },

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
      LEFT JOIN depots d ON u.depot_id = d.id
      WHERE u.id = ?
      `,
      [id]
    );

    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    return rows[0];
  },

  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO users
      (name, email, password_hash, role, depot_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        data.name,
        data.email,
        data.password_hash,
        data.role,
        data.depot_id || null,
        data.status || "ACTIVE",
      ]
    );

    return result.insertId;
  },

  async update(id, data) {
    const [result] = await db.execute(
      `
      UPDATE users
      SET name = ?,
          email = ?,
          role = ?,
          depot_id = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        data.name,
        data.email,
        data.role,
        data.depot_id || null,
        data.status,
        id,
      ]
    );

    return result.affectedRows;
  },

  async updatePassword(id, passwordHash) {
    const [result] = await db.execute(
      `
      UPDATE users
      SET password_hash = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [passwordHash, id]
    );

    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    return result.affectedRows;
  },
};

module.exports = User;