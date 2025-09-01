import connectDB from './db/index.js'
import { PORT, MONGO_URL } from './config/index.js'
import app from './app.js'

connectDB(MONGO_URL).then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((e) => console.log(e.message));
