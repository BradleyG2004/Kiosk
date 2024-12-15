import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { taskId } = req.query;

        try {
            await prisma.task.delete({
                where: { id: taskId },
            });

            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).json({ message: 'Error deleting task' });
        }
    }
}