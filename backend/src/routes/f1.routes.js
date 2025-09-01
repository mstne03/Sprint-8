import { Router } from 'express'
import { fetchAndSaveMeetings, getAllMeetings } from '../controllers/meetings.controller.js'
import { importSaveDriversSeason } from '../controllers/driversSeason.controller.js'
import { importSaveDrivers } from '../controllers/drivers.controller.js'

const router = Router();

router.post("/meetings", fetchAndSaveMeetings);

router.post("/drivers", importSaveDriversSeason);

router.post("/drivers/identity", importSaveDrivers);

//router.get("/:year/drivers", getDriversSeason);

export default router;
