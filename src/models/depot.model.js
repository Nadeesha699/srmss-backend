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
      [id],
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
      [depotCode],
    );

    return rows[0];
  },

  async create(data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const managerId = data.manager_id || null;

      // Create depot
      const [result] = await connection.execute(
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
          managerId,
          data.status || "ACTIVE",
        ],
      );

      const depotId = result.insertId;

      // Assign depot to supervisor
      if (managerId) {
        const [manager] = await connection.execute(
          `
          SELECT id, role
          FROM users
          WHERE id = ?
          `,
          [managerId],
        );

        if (manager.length === 0 || manager[0].role !== "SUPERVISOR") {
          throw new Error("Selected manager must be a valid supervisor");
        }

        await connection.execute(
          `
          UPDATE users
          SET depot_id = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [depotId, managerId],
        );
      }

      await connection.commit();
      return depotId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // =========================================================
  // UPDATE DEPOT
  // =========================================================
  async update(id, data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Get the existing manager
      const [depots] = await connection.execute(
        `
        SELECT manager_id
        FROM depots
        WHERE id = ?
        `,
        [id],
      );

      if (depots.length === 0) {
        throw new Error("Depot not found");
      }

      const oldManagerId = depots[0].manager_id;
      const newManagerId = data.manager_id || null;

      // Validate the new manager
      if (newManagerId) {
        const [manager] = await connection.execute(
          `
          SELECT id, role
          FROM users
          WHERE id = ?
          `,
          [newManagerId],
        );

        if (manager.length === 0 || manager[0].role !== "SUPERVISOR") {
          throw new Error("Selected manager must be a valid supervisor");
        }
      }

      // Update depot
      const [result] = await connection.execute(
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
          newManagerId,
          data.status || "ACTIVE",
          id,
        ],
      );

      // Clear the previous manager's depot assignment
      if (oldManagerId && Number(oldManagerId) !== Number(newManagerId)) {
        await connection.execute(
          `
          UPDATE users
          SET depot_id = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND role = 'SUPERVISOR'
            AND depot_id = ?
          `,
          [oldManagerId, id],
        );
      }

      // Assign the new manager to this depot
      if (newManagerId) {
        // Remove the supervisor from any previous depot
        // only if that depot still references this supervisor
        await connection.execute(
          `
          UPDATE depots
          SET manager_id = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE manager_id = ?
            AND id != ?
          `,
          [newManagerId, id],
        );

        await connection.execute(
          `
          UPDATE users
          SET depot_id = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND role = 'SUPERVISOR'
          `,
          [id, newManagerId],
        );
      }

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
      [status, id],
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
      [id],
    );

    return result.affectedRows;
  },
};

module.exports = Depot;
