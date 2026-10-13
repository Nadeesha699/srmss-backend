const db = require("../../config/db");
const Assignment = require("../models/assignment.model");
const Trip = require("../models/trip.model");
const ACTIVE_STATUSES = ["ASSIGNED", "IN_PROGRESS"];

const assignmentService = {
  getAll() {
    return Assignment.findAll();
  },

  async getById(id) {
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    return assignment;
  },

  async validate(data, excludeId = null) {
    const { schedule_id, bus_id, driver_id, staff_id } = data;

    if (!schedule_id || !bus_id || !driver_id || !staff_id) {
      throw new Error(
        "Schedule, bus, driver and operational staff are required",
      );
    }

    const [schedules] = await db.execute(
      "SELECT * FROM schedules WHERE id = ?",
      [schedule_id],
    );

    if (!schedules.length) {
      throw new Error("Schedule not found");
    }

    const schedule = schedules[0];

    if (schedule.status && schedule.status !== "SCHEDULED") {
      throw new Error("Only scheduled services can be assigned");
    }

    const [buses] = await db.execute("SELECT * FROM buses WHERE id = ?", [
      bus_id,
    ]);

    if (!buses.length) {
      throw new Error("Bus not found");
    }

    if (buses[0].status !== "AVAILABLE") {
      throw new Error("The selected bus is not available");
    }

    const [drivers] = await db.execute("SELECT * FROM drivers WHERE id = ?", [
      driver_id,
    ]);

    if (!drivers.length) {
      throw new Error("Driver not found");
    }

    const driver = drivers[0];

    if (driver.status !== "AVAILABLE") {
      throw new Error("The selected driver is not available");
    }

    if (
      !driver.license_expiry ||
      new Date(driver.license_expiry).getTime() <
        new Date(schedule.schedule_date).getTime()
    ) {
      throw new Error("The driver's licence must be valid on the service date");
    }

    const [staffRows] = await db.execute(
      `SELECT id, role, status, depot_id
       FROM users
       WHERE id = ?`,
      [staff_id],
    );

    if (!staffRows.length) {
      throw new Error("Operational Staff member not found");
    }

    const staff = staffRows[0];

    if (staff.role !== "OPERATIONAL_STAFF") {
      throw new Error("Selected user must be Operational Staff");
    }

    if (staff.status && staff.status !== "ACTIVE") {
      throw new Error("Selected staff account is not active");
    }

    for (const [resource, id] of [
      ["bus", bus_id],
      ["driver", driver_id],
      ["staff", staff_id],
    ]) {
      const conflicts = await Assignment.findConflicts(
        resource,
        id,
        schedule_id,
        excludeId,
      );

      if (conflicts.length) {
        throw new Error(`Selected ${resource} has an overlapping assignment`);
      }
    }

    return schedule;
  },

  async create(data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Validate the schedule, bus, driver and staff
      await this.validate(data);

      // 2. Create assignment
      const [assignmentResult] = await connection.execute(
        `INSERT INTO assignments
       (schedule_id, bus_id, driver_id, staff_id, assigned_by, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.schedule_id,
          data.bus_id,
          data.driver_id,
          data.staff_id,
          data.assigned_by,
          "ASSIGNED",
        ],
      );

      const assignmentId = assignmentResult.insertId;

      // 3. Create trip (not started yet)
      await connection.execute(
        `INSERT INTO trips
       (schedule_id, assignment_id, status)
       VALUES (?, ?, ?)`,
        [data.schedule_id, assignmentId, "SCHEDULED"],
      );

      // 4. Update schedule status
      const [scheduleResult] = await connection.execute(
        `UPDATE schedules
       SET status = 'ASSIGNED'
       WHERE id = ? AND status = 'SCHEDULED'`,
        [data.schedule_id],
      );

      if (scheduleResult.affectedRows !== 1) {
        throw new Error("Schedule is no longer available for assignment");
      }

      // 5. Update bus status
      const [busResult] = await connection.execute(
        `UPDATE buses
       SET status = 'ASSIGNED'
       WHERE id = ? AND status = 'AVAILABLE'`,
        [data.bus_id],
      );

      if (busResult.affectedRows !== 1) {
        throw new Error("Bus is no longer available");
      }

      // 6. Update driver status
      const [driverResult] = await connection.execute(
        `UPDATE drivers
       SET status = 'ON_DUTY'
       WHERE id = ? AND status = 'AVAILABLE'`,
        [data.driver_id],
      );

      if (driverResult.affectedRows !== 1) {
        throw new Error("Driver is no longer available");
      }

      // 7. Commit all changes
      await connection.commit();

      return {
        assignment_id: assignmentId,
        message:
          "Assignment created, trip scheduled, schedule updated, bus assigned and driver marked on duty",
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async update(id, data) {
    const existing = await this.getById(id);

    if (ACTIVE_STATUSES.includes(existing.status) === false) {
      throw new Error("Only active assignments can be edited");
    }

    await this.validate(data, id);

    return Assignment.update(id, {
      ...data,
      status: "ASSIGNED",
    });
  },

  async updateStatus(id, status) {
    const existing = await this.getById(id);

    const validStatuses = ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

    if (!validStatuses.includes(status)) {
      throw new Error("Invalid assignment status");
    }

    if (["COMPLETED", "CANCELLED"].includes(existing.status)) {
      throw new Error("Completed or cancelled assignments cannot be changed");
    }

    return Assignment.updateStatus(id, status);
  },

  async delete(id) {
    const existing = await this.getById(id);

    if (existing.status === "IN_PROGRESS") {
      throw new Error("An assignment in progress cannot be deleted");
    }

    // Preserve the assignment history. Prefer cancellation.
    return Assignment.updateStatus(id, "CANCELLED");
  },
};

module.exports = assignmentService;
