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


async updateStatus(id, data) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Lock and retrieve the trip.
    const [trips] = await connection.execute(
      `SELECT id, schedule_id, assignment_id, status
       FROM trips
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (!trips.length) {
      throw new Error("Trip not found");
    }

    const trip = trips[0];
    const currentStatus = String(trip.status).toUpperCase();
    const nextStatus = String(data.status || "").toUpperCase();

    if (!["IN_PROGRESS", "COMPLETED"].includes(nextStatus)) {
      throw new Error("Invalid trip status");
    }

    if (currentStatus === "COMPLETED") {
      throw new Error("Trip is already completed");
    }

    if (currentStatus === "CANCELLED") {
      throw new Error("A cancelled trip cannot be updated");
    }

    // 2. Validate allowed transitions.
    const allowedTransitions = {
      SCHEDULED: ["IN_PROGRESS"],
      IN_PROGRESS: ["COMPLETED"],
      DELAYED: ["IN_PROGRESS", "COMPLETED"],
    };

    const allowedNextStatuses = allowedTransitions[currentStatus] || [];

    if (!allowedNextStatuses.includes(nextStatus)) {
      throw new Error(
        `Cannot change trip status from ${currentStatus} to ${nextStatus}`
      );
    }

    // 3. Retrieve assignment resources.
    let busId = null;
    let driverId = null;

    if (trip.assignment_id) {
      const [assignments] = await connection.execute(
        `SELECT id, bus_id, driver_id, staff_id, status
         FROM assignments
         WHERE id = ?
         FOR UPDATE`,
        [trip.assignment_id]
      );

      if (!assignments.length) {
        throw new Error("Trip assignment not found");
      }

      const assignment = assignments[0];

      busId = assignment.bus_id;
      driverId = assignment.driver_id;

      if (!assignment.bus_id) {
        throw new Error("No bus is assigned to this trip");
      }

      if (!assignment.staff_id) {
        throw new Error("No operational staff member is assigned to this trip");
      }
    }

    // 4. Update trip status and preserve the original start time
    // when resuming a delayed trip.
    const now = new Date();

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
             ELSE NULL
           END
       WHERE id = ?`,
      [
        nextStatus,
        nextStatus,
        data.actual_start_time || now,
        nextStatus,
        data.actual_end_time || now,
        id,
      ]
    );

    // 5. Keep the assignment active until the trip is completed.
    // A delayed trip still retains its bus, driver, and staff assignment.
    if (trip.assignment_id) {
      await connection.execute(
        `UPDATE assignments
         SET status = ?
         WHERE id = ?`,
        [
          nextStatus === "COMPLETED" ? "COMPLETED" : "ASSIGNED",
          trip.assignment_id,
        ]
      );
    }

    // 6. Update the schedule when the trip starts or resumes.
    if (nextStatus === "IN_PROGRESS") {
      await connection.execute(
        `UPDATE schedules
         SET status = 'IN_PROGRESS'
         WHERE id = ?
           AND status <> 'CANCELLED'`,
        [trip.schedule_id]
      );
    }

    // 7. Complete the schedule only when every trip is completed.
    if (nextStatus === "COMPLETED") {
      const [remainingTrips] = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM trips
         WHERE schedule_id = ?
           AND status <> 'COMPLETED'`,
        [trip.schedule_id]
      );

      if (Number(remainingTrips[0].total) === 0) {
        await connection.execute(
          `UPDATE schedules
           SET status = 'COMPLETED'
           WHERE id = ?
             AND status <> 'CANCELLED'`,
          [trip.schedule_id]
        );
      }

      // 8. Release the bus only if no other active assignment uses it.
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
            [busId]
          );
        }
      }

      // 9. Release the driver only if no other active assignment uses them.
      if (driverId !== null) {
        const [driverAssignments] = await connection.execute(
          `SELECT COUNT(*) AS total
           FROM assignments
           WHERE driver_id = ?
             AND id <> ?
             AND status IN ('ASSIGNED', 'IN_PROGRESS')`,
          [driverId, trip.assignment_id]
        );

        if (Number(driverAssignments[0].total) === 0) {
          await connection.execute(
            `UPDATE drivers
             SET status = 'AVAILABLE'
             WHERE id = ?
               AND status = 'ON_DUTY'`,
            [driverId]
          );
        }
      }
    }

    // 10. Commit all changes together.
    await connection.commit();

    return {
      affectedRows: 1,
      trip_status: nextStatus,
      assignment_status:
        nextStatus === "COMPLETED" ? "COMPLETED" : "ASSIGNED",
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
}

};

module.exports = Trip;
