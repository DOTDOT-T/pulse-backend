// src/API/auth/register.ts
import { FastifyInstance } from 'fastify';
import { prisma } from '../../../lib/prisma';

export async function authRegisterRoutes(app: FastifyInstance) {
    app.post('/signup', async (request, reply) => {
        const { email, password, name } = request.body as any;
        const bcrypt = await import('bcrypt');

        const hashed = await bcrypt.hash(password, 10);

        try {
            const user = await prisma.user.create({
                data: { email, password: hashed, name },
            });

            const token = app.jwt.sign({ id: user.id, email: user.email });

            return { user, token };
        } catch (e: any) {
            if (e?.code === 'P2002') {
                reply.code(409);
                return { error: 'Email already in use' };
            }
            throw e;
        }
    });

    app.post('/login', async (request, reply) => {
        const { email, password } = request.body as {
            email: string;
            password: string;
        };

        const bcrypt = await import('bcrypt');

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            reply.code(401);
            return { error: 'Invalid credentials' };
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            reply.code(401);
            return { error: 'Invalid credentials' };
        }

        const token = app.jwt.sign(
            { id: user.id, email: user.email },
            { expiresIn: '15m' }
        );

        const refreshToken = app.jwt.sign(
            { id: user.id },
            { expiresIn: '7d' }
        );

        return {
            token,
            refreshToken,
            name: user.name,
        };
    });
}
