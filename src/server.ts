import cron from 'node-cron';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { checkMilestoneDeadlines } from './services/milestoneNotificationJob';

async function start() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connected successfully');

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });

    // US14: checagem diaria de marcos perto do prazo/atrasados. O Render free
    // tier hiberna sem trafego, entao este cron pode nao disparar sozinho;
    // checkMilestoneDeadlines fica exportada para disparo manual (endpoint
    // de admin ou cron externo) se isso acontecer.
    cron.schedule('0 8 * * *', () => {
      checkMilestoneDeadlines().catch((error) => {
        console.error('Failed to run milestone deadline check:', error);
      });
    }, { timezone: 'America/Sao_Paulo' });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
