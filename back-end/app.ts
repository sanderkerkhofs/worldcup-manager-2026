import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { authRouter } from './controller/authController';
import { competitionRouter } from './controller/tournamentController';
import { playerRouter } from './controller/playerController';
import { matchRouter } from './controller/matchController';
import { userRouter } from './controller/userController';
import { errorHandler } from './util/middleware';
import { swaggerDocument } from './util/swagger';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = Number(process.env.APP_PORT ?? 3000);

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? '*',
  credentials: true,
}));
app.use(bodyParser.json());

app.get('/status', (_req, res) => {
  res.json({ message: 'Back-end is running...' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRouter);
app.use('/api/competition', competitionRouter);
app.use('/api/tournaments', competitionRouter);
app.use('/api/players', playerRouter);
app.use('/api/matches', matchRouter);
app.use('/api/users', userRouter);

app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Back-end is running on port ${port}.`);
  });
}

export default app;
