import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;