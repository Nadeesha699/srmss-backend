const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes")
const depotRoutes = require('./routes/depot.routes')
const busRoutes = require('./routes/bus.routes')
const routeRoutes = require('./routes/route.routes')
const scheduleRoutes = require('./routes/schedule.routes')
const tripRoutes = require('./routes/trip.routes')
const delayRoutes = require('./routes/delay.routes')
const fuelRoutes = require('./routes/fuel.routes')
const maintenanceRoutes = require('./routes/maintenance.routes') 
const reportRoutes = require('./routes/report.routes')
const assignmentRoutes = require("./routes/assignment.routes");
const driverRoutes = require("./routes/driver.routes");

app.use(express.json());
app.use(cors());


app.use("/api/drivers", driverRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/depots", depotRoutes);
app.use("/api/users", userRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/delays", delayRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/assignments",assignmentRoutes);


const errorHandler = require("../src/middlewares/errorHandler");
app.use(errorHandler);

module.exports = app;
