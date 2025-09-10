import connectDB from './db/index.js'
import { PORT, MONGO_URL, SECOND_MONGO_URL } from './config/index.js'
import app from './app.js'
import fillDB from './jobs/cron.js'

connectDB(SECOND_MONGO_URL).then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })

    fillDB();
})
.catch((e) => console.log(e.message));
