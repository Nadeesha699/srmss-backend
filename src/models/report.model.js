
const db = require("../../config/db");

const Report = {
  // ==========================================================
  // DASHBOARD SUMMARY
  // ==========================================================

  async getDashboardSummary() {
    const [
      [routeResult],
      [busResult],
      [staffResult],
      [tripResult],
      [depotResult],
      [fuelResult],
      [maintenanceResult],
      [todayTripResult],
    ] = await Promise.all([
      // Active routes
      db.execute(`
        SELECT COUNT(*) AS total
        FROM routes
        WHERE status = 'ACTIVE'
      `),

      // Active/available buses
      db.execute(`
        SELECT COUNT(*) AS total
        FROM buses
        WHERE status IN ('ACTIVE', 'AVAILABLE', 'IN_SERVICE')
      `),

      // Operational staff
      db.execute(`
        SELECT COUNT(*) AS total
        FROM users
        WHERE role = 'OPERATIONAL_STAFF'
        AND status NOT IN ('SUSPENDED', 'INACTIVE')
      `),

      // Total trips
      db.execute(`
        SELECT COUNT(*) AS total
        FROM trips
      `),

      // Active depots
      db.execute(`
        SELECT COUNT(*) AS total
        FROM depots
        WHERE status = 'ACTIVE'
      `),

      // Total fuel cost
      db.execute(`
        SELECT
          COALESCE(SUM(total_cost), 0) AS total
        FROM fuel_records
      `),

      // Total maintenance cost
      db.execute(`
        SELECT
          COALESCE(SUM(cost), 0) AS total
        FROM maintenance
      `),

      // Today's trips
      db.execute(`
        SELECT
          COUNT(*) AS total,

          SUM(
            CASE
              WHEN status = 'COMPLETED'
              THEN 1
              ELSE 0
            END
          ) AS completed,

          SUM(
            CASE
              WHEN status = 'DELAYED'
              THEN 1
              ELSE 0
            END
          ) AS delayed

        FROM trips
        WHERE DATE(
          COALESCE(
            service_date,
            created_at
          )
        ) = CURDATE()
      `),
    ]);

    const todayTotal =
      Number(todayTripResult[0].total) || 0;

    const todayCompleted =
      Number(todayTripResult[0].completed) || 0;

    const todayDelayed =
      Number(todayTripResult[0].delayed) || 0;

    const performance =
      todayTotal > 0
        ? Number(
            (
              (todayCompleted / todayTotal) *
              100
            ).toFixed(2)
          )
        : 0;

    return {
      active_routes:
        Number(routeResult[0].total) || 0,

      active_buses:
        Number(busResult[0].total) || 0,

      operational_staff:
        Number(staffResult[0].total) || 0,

      total_trips:
        Number(tripResult[0].total) || 0,

      active_depots:
        Number(depotResult[0].total) || 0,

      total_fuel_cost:
        Number(fuelResult[0].total) || 0,

      total_maintenance_cost:
        Number(maintenanceResult[0].total) || 0,

      today_trips: todayTotal,

      completed_today: todayCompleted,

      delayed_today: todayDelayed,

      performance,
    };
  },

  // ==========================================================
  // TRIP STATISTICS
  // ==========================================================

  async getTripStatistics() {
    const [rows] = await db.execute(`
      SELECT
        status,
        COUNT(*) AS total
      FROM trips
      GROUP BY status
      ORDER BY total DESC
    `);

    return rows;
  },

  // ==========================================================
  // TRIP COMPLETION REPORT
  // ==========================================================

  async getTripCompletionReport() {
    const [rows] = await db.execute(`
      SELECT
        COUNT(*) AS total_trips,

        SUM(
          CASE
            WHEN status = 'COMPLETED'
            THEN 1
            ELSE 0
          END
        ) AS completed_trips,

        SUM(
          CASE
            WHEN status = 'DELAYED'
            THEN 1
            ELSE 0
          END
        ) AS delayed_trips,

        SUM(
          CASE
            WHEN status = 'CANCELLED'
            THEN 1
            ELSE 0
          END
        ) AS cancelled_trips,

        SUM(
          CASE
            WHEN status = 'SCHEDULED'
            THEN 1
            ELSE 0
          END
        ) AS scheduled_trips,

        SUM(
          CASE
            WHEN status = 'IN_PROGRESS'
            THEN 1
            ELSE 0
          END
        ) AS in_progress_trips

      FROM trips
    `);

    return rows[0];
  },

  // ==========================================================
  // FUEL REPORT
  // ==========================================================

  async getFuelStatistics() {
    const [rows] = await db.execute(`
      SELECT
        DATE_FORMAT(fuel_date, '%Y-%m') AS month,

        COALESCE(
          SUM(quantity_liters),
          0
        ) AS total_liters,

        COALESCE(
          SUM(total_cost),
          0
        ) AS total_cost,

        COALESCE(
          AVG(total_cost),
          0
        ) AS average_cost

      FROM fuel_records

      GROUP BY DATE_FORMAT(
        fuel_date,
        '%Y-%m'
      )

      ORDER BY month ASC
    `);

    return rows;
  },

  // ==========================================================
  // FUEL BY BUS
  // ==========================================================

  async getFuelByBus() {
    const [rows] = await db.execute(`
      SELECT
        b.id,
        b.registration_no,

        COALESCE(
          SUM(f.quantity_liters),
          0
        ) AS total_liters,

        COALESCE(
          SUM(f.total_cost),
          0
        ) AS total_cost,

        MAX(
          f.odometer_reading
        ) AS latest_mileage

      FROM buses b

      LEFT JOIN fuel_records f
        ON b.id = f.bus_id

      GROUP BY
        b.id,
        b.registration_no

      ORDER BY total_cost DESC
    `);

    return rows;
  },

  // ==========================================================
  // MAINTENANCE REPORT
  // ==========================================================

  async getMaintenanceStatistics() {
    const [rows] = await db.execute(`
      SELECT
        DATE_FORMAT(
          created_at,
          '%Y-%m'
        ) AS month,

        COUNT(*) AS maintenance_count,

        COALESCE(
          SUM(cost),
          0
        ) AS total_cost

      FROM maintenance

      GROUP BY DATE_FORMAT(
        created_at,
        '%Y-%m'
      )

      ORDER BY month ASC
    `);

    return rows;
  },

  // ==========================================================
  // MAINTENANCE BY BUS
  // ==========================================================

  async getMaintenanceByBus() {
    const [rows] = await db.execute(`
      SELECT
        b.id,
        b.registration_no,

        COUNT(m.id) AS maintenance_count,

        COALESCE(
          SUM(m.cost),
          0
        ) AS total_cost

      FROM buses b

      LEFT JOIN maintenance m
        ON b.id = m.bus_id

      GROUP BY
        b.id,
        b.registration_no

      ORDER BY maintenance_count DESC
    `);

    return rows;
  },

  // ==========================================================
  // ROUTE PERFORMANCE
  // ==========================================================

  async getRoutePerformance() {
    const [rows] = await db.execute(`
      SELECT
        r.id,
        r.route_code,
        r.name,
        r.start_point,
        r.end_point,
        r.distance_km,

        COUNT(t.id) AS total_trips,

        SUM(
          CASE
            WHEN t.status = 'COMPLETED'
            THEN 1
            ELSE 0
          END
        ) AS completed_trips,

        SUM(
          CASE
            WHEN t.status = 'DELAYED'
            THEN 1
            ELSE 0
          END
        ) AS delayed_trips,

        SUM(
          CASE
            WHEN t.status = 'CANCELLED'
            THEN 1
            ELSE 0
          END
        ) AS cancelled_trips

      FROM routes r

      LEFT JOIN schedules s
        ON r.id = s.route_id

      LEFT JOIN trips t
        ON s.id = t.schedule_id

      GROUP BY
        r.id,
        r.route_code,
        r.name,
        r.start_point,
        r.end_point,
        r.distance_km

      ORDER BY total_trips DESC
    `);

    return rows;
  },

  // ==========================================================
  // DEPOT PERFORMANCE
  // ==========================================================

  async getDepotPerformance() {
    const [rows] = await db.execute(`
      SELECT
        d.id,
        d.depot_code,
        d.name,
        d.location,

        /* Bus statistics */
        (
          SELECT COUNT(*)
          FROM buses b
          WHERE b.depot_id = d.id
        ) AS total_buses,

        (
          SELECT COUNT(*)
          FROM buses b
          WHERE b.depot_id = d.id
          AND b.status IN (
            'ACTIVE',
            'AVAILABLE',
            'IN_SERVICE'
          )
        ) AS active_buses,

        /* Operational staff statistics */
        (
          SELECT COUNT(*)
          FROM users u
          WHERE u.depot_id = d.id
          AND u.role = 'OPERATIONAL_STAFF'
          AND u.status NOT IN (
            'SUSPENDED',
            'INACTIVE'
          )
        ) AS total_operational_staff,

        /* Trip statistics */
        (
          SELECT COUNT(*)
          FROM trips t
          WHERE t.depot_id = d.id
        ) AS total_trips,

        (
          SELECT COUNT(*)
          FROM trips t
          WHERE t.depot_id = d.id
          AND t.status = 'COMPLETED'
        ) AS completed_trips,

        (
          SELECT COUNT(*)
          FROM trips t
          WHERE t.depot_id = d.id
          AND t.status = 'DELAYED'
        ) AS delayed_trips,

        (
          SELECT COUNT(*)
          FROM trips t
          WHERE t.depot_id = d.id
          AND t.status = 'CANCELLED'
        ) AS cancelled_trips

      FROM depots d

      ORDER BY total_trips DESC
    `);

    return rows;
  },

  // ==========================================================
  // DELAY REPORT
  // ==========================================================

  async getDelayReport() {
    const [rows] = await db.execute(`
      SELECT
        dl.id,
        dl.trip_id,
        dl.delay_minutes,
        dl.reason,
        dl.description,
        dl.created_at,

        t.trip_no,

        r.route_code,
        r.name AS route_name,

        b.registration_no,

        u.id AS staff_id,
        u.name AS staff_name

      FROM delays dl

      JOIN trips t
        ON dl.trip_id = t.id

      LEFT JOIN schedules s
        ON t.schedule_id = s.id

      LEFT JOIN routes r
        ON s.route_id = r.id

      LEFT JOIN buses b
        ON t.bus_id = b.id

      LEFT JOIN users u
        ON dl.reported_by = u.id
        AND u.role = 'OPERATIONAL_STAFF'

      ORDER BY dl.created_at DESC
    `);

    return rows;
  },

  // ==========================================================
  // VEHICLE UTILIZATION
  // ==========================================================

  async getVehicleUtilization() {
    const [rows] = await db.execute(`
      SELECT
        b.id,
        b.registration_no,
        b.capacity,
        b.mileage,
        b.status,

        COUNT(t.id) AS total_trips,

        SUM(
          CASE
            WHEN t.status = 'COMPLETED'
            THEN 1
            ELSE 0
          END
        ) AS completed_trips,

        SUM(
          CASE
            WHEN t.status = 'DELAYED'
            THEN 1
            ELSE 0
          END
        ) AS delayed_trips

      FROM buses b

      LEFT JOIN trips t
        ON b.id = t.bus_id

      GROUP BY
        b.id,
        b.registration_no,
        b.capacity,
        b.mileage,
        b.status

      ORDER BY total_trips DESC
    `);

    return rows;
  },

  // ==========================================================
  // OPERATIONAL STAFF WORKLOAD
  // ==========================================================

  async getOperationalStaffWorkload() {
    const [rows] = await db.execute(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.status,
        u.depot_id,

        d.name AS depot_name,

        COUNT(t.id) AS total_trips,

        SUM(
          CASE
            WHEN t.status = 'COMPLETED'
            THEN 1
            ELSE 0
          END
        ) AS completed_trips,

        SUM(
          CASE
            WHEN t.status = 'DELAYED'
            THEN 1
            ELSE 0
          END
        ) AS delayed_trips

      FROM users u

      LEFT JOIN depots d
        ON u.depot_id = d.id

      LEFT JOIN trips t
        ON t.staff_id = u.id

      WHERE u.role = 'OPERATIONAL_STAFF'

      GROUP BY
        u.id,
        u.name,
        u.email,
        u.phone,
        u.status,
        u.depot_id,
        d.name

      ORDER BY total_trips DESC
    `);

    return rows;
  },

  // ==========================================================
  // STAFF PERFORMANCE
  // ==========================================================

  async getOperationalStaffPerformance() {
    const [rows] = await db.execute(`
      SELECT
        u.id,
        u.name,

        COUNT(t.id) AS total_trips,

        SUM(
          CASE
            WHEN t.status = 'COMPLETED'
            THEN 1
            ELSE 0
          END
        ) AS completed_trips,

        SUM(
          CASE
            WHEN t.status = 'DELAYED'
            THEN 1
            ELSE 0
          END
        ) AS delayed_trips,

        SUM(
          CASE
            WHEN t.status = 'CANCELLED'
            THEN 1
            ELSE 0
          END
        ) AS cancelled_trips,

        CASE
          WHEN COUNT(t.id) > 0
          THEN ROUND(
            (
              SUM(
                CASE
                  WHEN t.status = 'COMPLETED'
                  THEN 1
                  ELSE 0
                END
              ) / COUNT(t.id)
            ) * 100,
            2
          )
          ELSE 0
        END AS completion_rate

      FROM users u

      LEFT JOIN trips t
        ON t.staff_id = u.id

      WHERE u.role = 'OPERATIONAL_STAFF'

      GROUP BY
        u.id,
        u.name

      ORDER BY completion_rate DESC
    `);

    return rows;
  },

  // ==========================================================
  // TODAY'S OPERATIONAL SUMMARY
  // ==========================================================

  async getTodayOperationalSummary() {
    const [rows] = await db.execute(`
      SELECT

        COUNT(*) AS total_trips,

        SUM(
          CASE
            WHEN status = 'SCHEDULED'
            THEN 1
            ELSE 0
          END
        ) AS scheduled_trips,

        SUM(
          CASE
            WHEN status = 'IN_PROGRESS'
            THEN 1
            ELSE 0
          END
        ) AS running_trips,

        SUM(
          CASE
            WHEN status = 'DELAYED'
            THEN 1
            ELSE 0
          END
        ) AS delayed_trips,

        SUM(
          CASE
            WHEN status = 'COMPLETED'
            THEN 1
            ELSE 0
          END
        ) AS completed_trips,

        SUM(
          CASE
            WHEN status = 'CANCELLED'
            THEN 1
            ELSE 0
          END
        ) AS cancelled_trips

      FROM trips

      WHERE DATE(
        COALESCE(
          service_date,
          created_at
        )
      ) = CURDATE()
    `);

    return rows[0];
  },

  // ==========================================================
  // ACTIVE ASSIGNMENTS
  // ==========================================================

  async getAssignmentStatistics() {
    const [rows] = await db.execute(`
      SELECT
        a.status,
        COUNT(*) AS total

      FROM assignments a

      GROUP BY a.status

      ORDER BY total DESC
    `);

    return rows;
  },

  // ==========================================================
  // ROUTE UTILIZATION
  // ==========================================================

  async getRouteUtilization() {
    const [rows] = await db.execute(`
      SELECT
        r.id,
        r.route_code,
        r.name,

        COUNT(DISTINCT s.id) AS total_schedules,

        COUNT(DISTINCT t.id) AS total_trips,

        COUNT(
          DISTINCT CASE
            WHEN t.status = 'COMPLETED'
            THEN t.id
          END
        ) AS completed_trips,

        COUNT(
          DISTINCT CASE
            WHEN t.status = 'DELAYED'
            THEN t.id
          END
        ) AS delayed_trips

      FROM routes r

      LEFT JOIN schedules s
        ON r.id = s.route_id

      LEFT JOIN trips t
        ON s.id = t.schedule_id

      GROUP BY
        r.id,
        r.route_code,
        r.name

      ORDER BY total_trips DESC
    `);

    return rows;
  },
};

module.exports = Report;
