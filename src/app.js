require('dotenv').config();
const express     = require('express');
const cookieParser = require('cookie-parser');
const authRoutes  = require('./routes/auth');
const passRoutes  = require('./pass/passRoute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // NICE 콜백은 form-data
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/pass', passRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[서버] http://localhost:${PORT}`));
