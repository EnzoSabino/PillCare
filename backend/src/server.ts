import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { routes } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());
app.use(routes);

app.get('/health', (req, res) => {
  return res.json({
    status: 'ok',
    message: 'Servidor backend a funcionar perfeitamente! 🚀',
  });
});

app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});