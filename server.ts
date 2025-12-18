import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { prisma } from './lib/prisma';
import { authRegisterRoutes } from './src/API/auth/Register';
import { ApplicationsDataRoutes } from './src/API/Application';

const app = Fastify({ logger: true });

app.register(cors, { origin: '*' });

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret',
});

app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Routes
app.get('/users', async () => prisma.user.findMany());

app.get('/me', { preHandler: [app.authenticate] }, async (request: any) => {
  return prisma.user.findUnique({
    where: { id: request.user.id },
    select: { id: true, email: true, name: true },
  });
});

app.get('/ping', async () => ({ result: 'pong' }));

app.register(authRegisterRoutes, { prefix: '/API/auth' });
app.register(ApplicationsDataRoutes, {prefix: '/applications'});

app.listen({ port: 5000 }, () => {
  console.log('Server running on http://localhost:5000');
});