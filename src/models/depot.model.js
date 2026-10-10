
const db = require("../../config/db");

const Depot = {
  // =========================================================
  // GET ALL DEPOTS
  // =========================================================
  async findAll() {
    const [rows] = await db.execute(`
      SELECT 
        d.id,
        d.depot_code,
        d.name,
        d.location,
        d.manager_id,
        d.status,
        d.created_at,
        d.updated_at,

        -- Supervisor information
        u.name AS supervisor_name,
        u.email AS supervisor_email,

        -- Total buses in this depot
        (
          SELECT COUNT(*)
          FROM buses b
          WHERE b.depot_id = d.id
        ) AS total_buses,

        -- Total operational staff in this depot
        (
          SELECT COUNT(*)
          FROM users os
          WHERE os.depot_id = d.id
            AND os.role = 'OPERATIONAL_STAFF'
        ) AS total_operational_staff

      FROM depots d

      LEFT JOIN users u
        ON d.manager_id = u.id
        AND u.role = 'SUPERVISOR'

      ORDER BY d.created_at DESC
    `);

    return rows;
  },

  // =========================================================
  // GET DEPOT BY ID
  // =========================================================
  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT 
        d.id,
        d.depot_code,
        d.name,
        d.location,
        d.manager_id,
        d.status,
        d.created_at,
        d.updated_at,

        -- Supervisor information
        u.name AS supervisor_name,
        u.email AS supervisor_email,

        -- Total buses
        (
          SELECT COUNT(*)
          FROM buses b
          WHERE b.depot_id = d.id
        ) AS total_buses,

        -- Total operational staff
        (
          SELECT COUNT(*)
          FROM users os
          WHERE os.depot_id = d.id
            AND os.role = 'OPERATIONAL_STAFF'
        ) AS total_operational_staff

      FROM depots d

      LEFT JOIN users u
        ON d.manager_id = u.id
        AND u.role = 'SUPERVISOR'

      WHERE d.id = ?

      LIMIT 1
      `,
      [id]
    );

    return rows[0];
  },

  // =========================================================
  // FIND DEPOT BY CODE
  // =========================================================
  async findByCode(depotCode) {
    const [rows] = await db.execute(
      `
      SELECT
        id,
        depot_code,
        name,
        location,
        manager_id,
        status,
        created_at,
        updated_at
      FROM depots
      WHERE depot_code = ?
      LIMIT 1
      `,
      [depotCode]
    );

    return rows[0];
  },

  // =========================================================
  // CREATE DEPOT
  // =========================================================
  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO depots
      (
        depot_code,
        name,
        location,
        manager_id,
        status
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        data.depot_code,
        data.name,
        data.location,
        data.manager_id || null,
        data.status || "ACTIVE",
      ]
    );

    return result.insertId;
  },

  // =========================================================
  // UPDATE DEPOT
  // =========================================================
  async update(id, data) {
    const [result] = await db.execute(
      `
      UPDATE depots
      SET
        depot_code = ?,
        name = ?,
        location = ?,
        manager_id = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        data.depot_code,
        data.name,
        data.location,
        data.manager_id || null,
        data.status || "ACTIVE",
        id,
      ]
    );

    return result.affectedRows;
  },

  // =========================================================
  // CHANGE DEPOT STATUS
  // =========================================================
  async updateStatus(id, status) {
    const [result] = await db.execute(
      `
      UPDATE depots
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [status, id]
    );

    return result.affectedRows;
  },

  // =========================================================
  // DELETE DEPOT
  // =========================================================
  async delete(id) {
    const [result] = await db.execute(
      `
      DELETE FROM depots
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows;
  },
};

module.exports = Depot;

