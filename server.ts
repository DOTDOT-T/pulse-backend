import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { prisma } from './lib/prisma';


const app = Fastify({ logger: true });

// Middleware CORS
app.register(cors, {
  origin: '*', // à restreindre en prod
});

// JWT
app.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret',
});

// Route test
app.get('/users', async () => {
  return prisma.user.findMany();
});

// Auth simple
app.post('/signup', async (request, reply) => {
  const { email, password, name } = request.body as any;
  const bcrypt = await import('bcrypt');

  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    const token = app.jwt.sign({ id: user.id, email: user.email });
    return { user, token };
  } catch (e: any) {
    // Prisma unique constraint error (duplicate email)
    if (e?.code === 'P2002') {
      reply.code(409);
      return { error: 'Email already in use' };
    }
    throw e;
  }
});

app.listen({ port: 5000 }, () => {
  console.log('Server running on http://localhost:5000');
});
