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
        u.password_hash,
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
        u.password_hash,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN depots d ON u.depot_id = d.id
      WHERE u.id = ?
      `,
      [id],
    );

    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    return rows[0];
  },

  async create(data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO users
        (name, email, password_hash, role, depot_id, status)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.email,
          data.password_hash,
          data.role,
          data.depot_id || null,
          data.status || "ACTIVE",
        ],
      );

      const userId = result.insertId;

      // Automatically assign the supervisor as depot manager
      if (data.role === "SUPERVISOR" && data.depot_id) {
        await connection.execute(
          `UPDATE depots
           SET manager_id = ?
           WHERE id = ?`,
          [userId, data.depot_id],
        );
      }

      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async update(id, data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Get the user's previous role and depot
      const [existingUsers] = await connection.execute(
        `SELECT role, depot_id
         FROM users
         WHERE id = ?`,
        [id],
      );

      if (existingUsers.length === 0) {
        throw new Error("User not found");
      }

      const oldUser = existingUsers[0];

      await connection.execute(
        `UPDATE users
         SET name = ?,
             email = ?,
             role = ?,
             depot_id = ?,
             status = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          data.name,
          data.email,
          data.role,
          data.depot_id || null,
          data.status,
          id,
        ],
      );

      // Clear the old depot manager assignment if necessary
      if (
        oldUser.role === "SUPERVISOR" &&
        (data.role !== "SUPERVISOR" ||
          Number(oldUser.depot_id) !== Number(data.depot_id))
      ) {
        await connection.execute(
          `UPDATE depots
           SET manager_id = NULL
           WHERE id = ? AND manager_id = ?`,
          [oldUser.depot_id, id],
        );
      }

      // Assign this supervisor to the new depot
      if (data.role === "SUPERVISOR" && data.depot_id) {
        await connection.execute(
          `UPDATE depots
           SET manager_id = ?
           WHERE id = ?`,
          [id, data.depot_id],
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async updateProfile(id, data) {
    const [result] = await db.execute(
      `UPDATE users
     SET name = ?,
         email = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
      [data.name, data.email, id],
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
      [passwordHash, id],
    );

    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);

    return result.affectedRows;
  },
};

module.exports = User;
