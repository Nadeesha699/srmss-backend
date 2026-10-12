const db = require("../../config/db");

const Trip = {
  /* =========================================================
     GET ALL TRIPS
  ========================================================= */

  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        t.id,
        t.schedule_id,
        t.assignment_id,
        t.status,
        t.actual_start_time,
        t.actual_end_time,
        t.created_at,
        t.updated_at,

        /* Schedule */
        s.schedule_code,
        s.schedule_date,
        s.departure_time,
        s.arrival_time,

        /* Route */
        r.id AS route_id,
        r.route_code,
        r.name AS route_name,
        r.start_point AS origin,
        r.end_point AS destination,

        /* Assignment */
        a.bus_id,
        a.staff_id,
        a.assigned_by,
        a.status AS assignment_status,

        /* Bus */
        b.registration_no,

        /* Operational Staff */
        u.name AS staff_name,
        u.email AS staff_email,

        /* Depot */
        dp.id AS depot_id,
        dp.name AS depot_name

      FROM trips t

      INNER JOIN schedules s
        ON t.schedule_id = s.id

      INNER JOIN routes r
        ON s.route_id = r.id

      LEFT JOIN assignments a
        ON t.assignment_id = a.id

      LEFT JOIN buses b
        ON a.bus_id = b.id

      LEFT JOIN users u
        ON a.staff_id = u.id

      LEFT JOIN depots dp
        ON b.depot_id = dp.id

      ORDER BY
        s.schedule_date DESC,
        s.departure_time DESC
    `);

    return rows;
  },

  /* =========================================================
     GET TRIP BY ID
  ========================================================= */

  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        t.id,
        t.schedule_id,
        t.assignment_id,
        t.status,
        t.actual_start_time,
        t.actual_end_time,
        t.created_at,
        t.updated_at,

        /* Schedule */
        s.schedule_code,
        s.schedule_date,
        s.departure_time,
        s.arrival_time,

        /* Route */
        r.id AS route_id,
        r.route_code,
        r.name AS route_name,
        r.start_point AS origin,
        r.end_point AS destination,

        /* Assignment */
        a.bus_id,
        a.staff_id,
        a.assigned_by,
        a.status AS assignment_status,

        /* Bus */
        b.registration_no,

        /* Operational Staff */
        u.name AS staff_name,
        u.email AS staff_email,

        /* Depot */
        dp.id AS depot_id,
        dp.name AS depot_name

      FROM trips t

      INNER JOIN schedules s
        ON t.schedule_id = s.id

      INNER JOIN routes r
        ON s.route_id = r.id

      LEFT JOIN assignments a
        ON t.assignment_id = a.id

      LEFT JOIN buses b
        ON a.bus_id = b.id

      LEFT JOIN users u
        ON a.staff_id = u.id

      LEFT JOIN depots dp
        ON b.depot_id = dp.id

      WHERE t.id = ?
      `,
      [id],
    );

    return rows[0];
  },

  /* =========================================================
     CREATE TRIP
  ========================================================= */

  async create(data) {
    const [result] = await db.execute(
      `
      INSERT INTO trips
      (
        schedule_id,
        assignment_id,
        status
      )
      VALUES (?, ?, ?)
      `,
      [data.schedule_id, data.assignment_id, data.status || "SCHEDULED"],
    );

    return result.insertId;
  },

  /* =========================================================
     UPDATE TRIP
  ========================================================= */

  async update(id, data) {
    const [result] = await db.execute(
      `
      UPDATE trips
      SET status = ?,
          actual_start_time = ?,
          actual_end_time = ?
      WHERE id = ?
      `,
      [
        data.status,
        data.actual_start_time || null,
        data.actual_end_time || null,
        id,
      ],
    );

    return result.affectedRows;
  },

  /* =========================================================
     UPDATE TRIP STATUS
  ========================================================= */

  async updateStatus(id, data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Get the trip and lock its row
      const [trips] = await connection.execute(
        `SELECT id, schedule_id, assignment_id, status
       FROM trips
       WHERE id = ?
       FOR UPDATE`,
        [id],
      );

      if (!trips.length) {
        throw new Error("Trip not found");
      }

      const trip = trips[0];
      const nextStatus = data.status;

      if (!["IN_PROGRESS", "COMPLETED"].includes(nextStatus)) {
        throw new Error("Invalid trip status");
      }

      if (trip.status === "COMPLETED") {
        throw new Error("Trip is already completed");
      }

      if (nextStatus === "COMPLETED" && trip.status !== "IN_PROGRESS") {
        throw new Error("Start the trip before completing it");
      }

      // 2. Update trip status and timestamps
      await connection.execute(
        `UPDATE trips
       SET status = ?,
           actual_start_time = CASE
             WHEN ? = 'IN_PROGRESS'
             THEN COALESCE(actual_start_time, ?)
             ELSE actual_start_time
           END,
           actual_end_time = CASE
             WHEN ? = 'COMPLETED' THEN ?
             ELSE actual_end_time
           END
       WHERE id = ?`,
        [
          nextStatus,
          nextStatus,
          data.actual_start_time || new Date(),
          nextStatus,
          data.actual_end_time || new Date(),
          id,
        ],
      );

      let busId = null;
      let driverId = null;

      // 3. Update assignment status and get bus/driver IDs
      if (trip.assignment_id) {
        const [assignments] = await connection.execute(
          `SELECT bus_id, driver_id
         FROM assignments
         WHERE id = ?
         FOR UPDATE`,
          [trip.assignment_id],
        );

        if (assignments.length > 0) {
          busId = assignments[0].bus_id;
          driverId = assignments[0].driver_id;
        }

        await connection.execute(
          `UPDATE assignments
         SET status = ?
         WHERE id = ?`,
          [nextStatus, trip.assignment_id],
        );
      }

      // 4. Update schedule when trip starts
      if (nextStatus === "IN_PROGRESS") {
        await connection.execute(
          `UPDATE schedules
         SET status = 'IN_PROGRESS'
         WHERE id = ?`,
          [trip.schedule_id],
        );
      }

      // 5. Complete schedule only when all required trips are completed
      if (nextStatus === "COMPLETED") {
        const [remaining] = await connection.execute(
          `SELECT COUNT(*) AS total
         FROM trips
         WHERE schedule_id = ?
           AND status <> 'COMPLETED'`,
          [trip.schedule_id],
        );

        if (Number(remaining[0].total) === 0) {
          await connection.execute(
            `UPDATE schedules
           SET status = 'COMPLETED'
           WHERE id = ?`,
            [trip.schedule_id],
          );
        }

        // 6. Release bus if it has no other active assignments
        if (busId !== null) {
          const [busAssignments] = await connection.execute(
            `SELECT COUNT(*) AS total
           FROM assignments
           WHERE bus_id = ?
             AND id <> ?
             AND status IN ('ASSIGNED', 'IN_PROGRESS')`,
            [busId, trip.assignment_id],
          );

          if (Number(busAssignments[0].total) === 0) {
            await connection.execute(
              `UPDATE buses
             SET status = 'AVAILABLE'
             WHERE id = ?
               AND status = 'ASSIGNED'`,
              [busId],
            );
          }
        }

        // 7. Release driver if there are no other active assignments
        if (driverId !== null) {
          const [driverAssignments] = await connection.execute(
            `SELECT COUNT(*) AS total
           FROM assignments
           WHERE driver_id = ?
             AND id <> ?
             AND status IN ('ASSIGNED', 'IN_PROGRESS')`,
            [driverId, trip.assignment_id],
          );

          if (Number(driverAssignments[0].total) === 0) {
            await connection.execute(
              `UPDATE drivers
             SET status = 'AVAILABLE'
             WHERE id = ?
               AND status = 'ON_DUTY'`,
              [driverId],
            );
          }
        }
      }

      // 8. Commit all changes together
      await connection.commit();

      return {
        affectedRows: 1,
        trip_status: nextStatus,
        assignment_status: nextStatus,
        assignment_id: trip.assignment_id,
        schedule_id: trip.schedule_id,
        bus_id: busId,
        driver_id: driverId,
        resources_released: nextStatus === "COMPLETED",
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = Trip;
