import { Router } from 'express'
import Driver from '../models/Driver.js'
import { DriverSeason } from '../models/DriverSeason.js'
import Meeting from '../models/Meeting.js'
import Chart from '../models/Chart.js'

const router = Router();

router.get("/:year/meetings", async (req, res) => {
    try {
        const year = Number(req.params.year);

        const meetings = await Meeting.find({ year });

        res.status(200).json(meetings);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
})

router.get("/:year/drivers", async (req, res) => {
    try {
        const year = req.params.year;

        const drivers = await DriverSeason.find({ year });

        res.status(200).json(drivers);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.get("/drivers/identity", async (req, res) => {
    try {
        const drivers = await Driver.find({});

        res.status(200).json(drivers);
    } catch(e) {
        res.status(500).json({ message: e.message });
    }
});

router.get("/:year/:chartType/:driver/charts", async (req, res) => {
    try {
        const year = Number(req.params.year);
        const chartType = req.params.chartType;
        const driver = req.params.driver;

        const filter = { year, chartType };
        if (driver !== "none") {
            filter["drivers"] = { $elemMatch: { $regex: driver, $options: "i" } };
        }

        const charts = await Chart.find(filter);

        res.status(200).json(charts);
    } catch (e) {
        console.error("Error message:",e.message);
        res.status(500).json({ message: e.message });
    }
})

export default router;
