// const db = require("../../config/db");

// const Assignment = {
//   // Get all assignments
//   async findAll() {
//     const [rows] = await db.execute(`
//       SELECT
//         a.id,
//         a.schedule_id,
//         a.bus_id,
//         a.staff_id,
//         a.assigned_by,
//         a.status,
//         a.created_at,
//         a.updated_at,

//         s.schedule_code,
//         s.route_id,
//         s.service_date,
//         s.departure_time,
//         s.arrival_time,

//         r.route_code,
//         r.route_name,
//         r.origin AS start_point,
//         r.destination AS end_point,

//         b.registration_no,
//         b.capacity,
//         b.service_type,
//         b.depot_id,

//         u.name AS staff_name,
//         u.email AS staff_email,
//         u.role AS staff_role,

//         assigned.name AS assigned_by_name

//       FROM assignments a

//       LEFT JOIN schedules s
//         ON a.schedule_id = s.id

//       LEFT JOIN routes r
//         ON s.route_id = r.id

//       LEFT JOIN buses b
//         ON a.bus_id = b.id

//       LEFT JOIN users u
//         ON a.staff_id = u.id

//       LEFT JOIN users assigned
//         ON a.assigned_by = assigned.id

//       ORDER BY a.id DESC
//     `);

//     return rows;
//   },

//   // Get assignment by ID
//   async findById(id) {
//     const [rows] = await db.execute(
//       `
//       SELECT
//         a.id,
//         a.schedule_id,
//         a.bus_id,
//         a.staff_id,
//         a.assigned_by,
//         a.status,
//         a.created_at,
//         a.updated_at,

//         s.schedule_code,
//         s.route_id,
//         s.service_date,
//         s.departure_time,
//         s.arrival_time,

//         r.route_code,
//         r.route_name,
//         r.origin AS start_point,
//         r.destination AS end_point,

//         b.registration_no,
//         b.capacity,
//         b.service_type,
//         b.depot_id,

//         u.name AS staff_name,
//         u.email AS staff_email,
//         u.role AS staff_role,

//         assigned.name AS assigned_by_name

//       FROM assignments a

//       LEFT JOIN schedules s
//         ON a.schedule_id = s.id

//       LEFT JOIN routes r
//         ON s.route_id = r.id

//       LEFT JOIN buses b
//         ON a.bus_id = b.id

//       LEFT JOIN users u
//         ON a.staff_id = u.id

//       LEFT JOIN users assigned
//         ON a.assigned_by = assigned.id

//       WHERE a.id = ?
//       `,
//       [id]
//     );

//     return rows[0];
//   },

//   // Check whether the schedule already has an assignment
//   async findBySchedule(scheduleId) {
//     const [rows] = await db.execute(
//       `
//       SELECT *
//       FROM assignments
//       WHERE schedule_id = ?
//         AND status != 'CANCELLED'
//       LIMIT 1
//       `,
//       [scheduleId]
//     );

//     return rows[0];
//   },

//   // Check whether a bus is already assigned to another active schedule
//   async findActiveBusAssignment(busId, scheduleId = null) {
//     let query = `
//       SELECT
//         a.*,
//         s.schedule_code,
//         s.service_date,
//         s.departure_time,
//         s.arrival_time
//       FROM assignments a
//       INNER JOIN schedules s
//         ON a.schedule_id = s.id
//       WHERE a.bus_id = ?
//         AND a.status IN ('ASSIGNED', 'IN_PROGRESS')
//     `;

//     const params = [busId];

//     if (scheduleId) {
//       query += ` AND a.schedule_id != ?`;
//       params.push(scheduleId);
//     }

//     query += `
//       ORDER BY s.service_date ASC, s.departure_time ASC
//       LIMIT 1
//     `;

//     const [rows] = await db.execute(query, params);

//     return rows[0];
//   },

//   // Check whether operational staff is already assigned
//   async findActiveStaffAssignment(staffId, scheduleId = null) {
//     let query = `
//       SELECT
//         a.*,
//         s.schedule_code,
//         s.service_date,
//         s.departure_time,
//         s.arrival_time
//       FROM assignments a
//       INNER JOIN schedules s
//         ON a.schedule_id = s.id
//       WHERE a.staff_id = ?
//         AND a.status IN ('ASSIGNED', 'IN_PROGRESS')
//     `;

//     const params = [staffId];

//     if (scheduleId) {
//       query += ` AND a.schedule_id != ?`;
//       params.push(scheduleId);
//     }

//     query += `
//       ORDER BY s.service_date ASC, s.departure_time ASC
//       LIMIT 1
//     `;

//     const [rows] = await db.execute(query, params);

//     return rows[0];
//   },

//   // Create assignment
//   async create(data) {
//     const [result] = await db.execute(
//       `
//       INSERT INTO assignments
//       (
//         schedule_id,
//         bus_id,
//         staff_id,
//         assigned_by,
//         status
//       )
//       VALUES (?, ?, ?, ?, ?)
//       `,
//       [
//         data.schedule_id,
//         data.bus_id,
//         data.staff_id,
//         data.assigned_by,
//         data.status || "ASSIGNED",
//       ]
//     );

//     return result.insertId;
//   },

//   // Update assignment
//   async update(id, data) {
//     const [result] = await db.execute(
//       `
//       UPDATE assignments
//       SET
//         schedule_id = ?,
//         bus_id = ?,
//         staff_id = ?,
//         status = ?
//       WHERE id = ?
//       `,
//       [
//         data.schedule_id,
//         data.bus_id,
//         data.staff_id,
//         data.status,
//         id,
//       ]
//     );

//     return result.affectedRows;
//   },

//   // Update status only
//   async updateStatus(id, status) {
//     const [result] = await db.execute(
//       `
//       UPDATE assignments
//       SET status = ?
//       WHERE id = ?
//       `,
//       [status, id]
//     );

//     return result.affectedRows;
//   },

//   // Delete assignment
//   async delete(id) {
//     const [result] = await db.execute(
//       `
//       DELETE FROM assignments
//       WHERE id = ?
//       `,
//       [id]
//     );

//     return result.affectedRows;
//   },
// };

// module.exports = Assignment;

const db = require("../../config/db");

const Assignment = {
  async findAll() {
    const [rows] = await db.execute(`
      SELECT
        a.id,
        a.schedule_id,
        a.bus_id,
        a.driver_id,
        a.staff_id,
        a.assigned_by,
        a.status,
        a.created_at,
        a.updated_at,

        s.schedule_code,
        s.schedule_date,
        s.departure_time,
        s.arrival_time,

        r.id AS route_id,
        r.route_code,
        r.name AS route_name,
        r.start_point,
        r.end_point,

        b.registration_no,
        b.capacity,
        b.status AS bus_status,
        b.depot_id,

        dr.employee_no,
        dr.name AS driver_name,
        dr.license_no AS driver_license_no,
        dr.license_expiry AS driver_license_expiry,
        dr.status AS driver_status,

        u.name AS staff_name,
        u.email AS staff_email,
        u.role AS staff_role,

        assigned.name AS assigned_by_name

      FROM assignments a
      INNER JOIN schedules s ON a.schedule_id = s.id
      INNER JOIN routes r ON s.route_id = r.id
      INNER JOIN buses b ON a.bus_id = b.id
      LEFT JOIN drivers dr ON a.driver_id = dr.id
      LEFT JOIN users u ON a.staff_id = u.id
      LEFT JOIN users assigned ON a.assigned_by = assigned.id

      ORDER BY a.id DESC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT
        a.*,
        s.schedule_code,
        s.schedule_date,
        s.departure_time,
        s.arrival_time,
        r.route_code,
        r.name AS route_name,
        r.start_point,
        r.end_point,
        b.registration_no,
        b.depot_id,
        dr.name AS driver_name,
        dr.employee_no,
        dr.license_no AS driver_license_no,
        dr.license_expiry AS driver_license_expiry,
        dr.status AS driver_status,
        u.name AS staff_name,
        assigned.name AS assigned_by_name
      FROM assignments a
      INNER JOIN schedules s ON a.schedule_id = s.id
      INNER JOIN routes r ON s.route_id = r.id
      INNER JOIN buses b ON a.bus_id = b.id
      LEFT JOIN drivers dr ON a.driver_id = dr.id
      LEFT JOIN users u ON a.staff_id = u.id
      LEFT JOIN users assigned ON a.assigned_by = assigned.id
      WHERE a.id = ?`,
      [id],
    );

    return rows[0] || null;
  },

  async findBySchedule(scheduleId) {
    const [rows] = await db.execute(
      `SELECT *
       FROM assignments
       WHERE schedule_id = ?
         AND status <> 'CANCELLED'
       ORDER BY id DESC`,
      [scheduleId],
    );

    return rows;
  },

  async findConflicts(resource, resourceId, scheduleId, excludeId = null) {
    const columns = {
      bus: "a.bus_id",
      driver: "a.driver_id",
      staff: "a.staff_id",
    };

    const column = columns[resource];

    if (!column) {
      throw new Error("Invalid assignment resource");
    }

    const params = [resourceId, scheduleId, excludeId];

    const [rows] = await db.execute(
      `SELECT a.id, a.status,
              s.schedule_date,
              s.departure_time,
              s.arrival_time
       FROM assignments a
       INNER JOIN schedules s ON a.schedule_id = s.id
       INNER JOIN schedules target ON target.id = ?
       WHERE ${column} = ?
         AND a.status IN ('ASSIGNED', 'IN_PROGRESS')
         AND a.id <> COALESCE(?, 0)
         AND s.schedule_date = target.schedule_date
         AND s.departure_time < target.arrival_time
         AND target.departure_time < s.arrival_time`,
      [scheduleId, resourceId, excludeId],
    );

    return rows;
  },

  async create(data) {
    const [result] = await db.execute(
      `INSERT INTO assignments
       (schedule_id, bus_id, driver_id, staff_id, assigned_by, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.schedule_id,
        data.bus_id,
        data.driver_id,
        data.staff_id,
        data.assigned_by,
        data.status || "ASSIGNED",
      ],
    );

    // Return the numeric ID, not an assignment object
    return result.insertId;
  },

  async update(id, data) {
    await db.execute(
      `UPDATE assignments
       SET schedule_id = ?,
           bus_id = ?,
           driver_id = ?,
           staff_id = ?,
           status = ?
       WHERE id = ?`,
      [
        data.schedule_id,
        data.bus_id,
        data.driver_id,
        data.staff_id,
        data.status || "ASSIGNED",
        id,
      ],
    );

    return this.findById(id);
  },

  async updateStatus(id, status) {
    await db.execute("UPDATE assignments SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    return this.findById(id);
  },

  async delete(id) {
    const [result] = await db.execute("DELETE FROM assignments WHERE id = ?", [
      id,
    ]);

    return result.affectedRows > 0;
  },
};

module.exports = Assignment;
