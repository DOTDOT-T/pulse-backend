// src/API/auth/register.ts
import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';

export async function ApplicationsDataRoutes(app: FastifyInstance) {
    app.get('/all', async () => {
        const apps = await prisma.application.findMany();

        return JSON.stringify(apps, null, 2);
    });
}
