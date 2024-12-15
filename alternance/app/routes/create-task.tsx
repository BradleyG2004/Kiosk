import { PrismaClient } from '@prisma/client';

interface TaskFormData {
  title: string;
  state: string;
  description: string;
  ownerId: number;
}

export async function action({ request }) {
  const prisma = new PrismaClient();
  const data: TaskFormData = await request.json(); // Parse the incoming JSON data

  // Validate required fields
  if (!data.title || !data.state || !data.description || !data.ownerId) {
    const missingFields = [];
    if (!data.title) missingFields.push('title');
    if (!data.state) missingFields.push('state');
    if (!data.description) missingFields.push('description');
    if (!data.ownerId) missingFields.push('ownerId');

    return new Response(JSON.stringify({ 
      success: false, 
      error: `The following fields are required: ${missingFields.join(', ')}` 
    }), {
      status: 400, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title: data.title, 
        state: data.state, 
        description: data.description, 
        // ownerId: data.ownerId, 
        owner: { connect: { id: data.ownerId } } 
      },
      include: { owner: true }
    });

    return new Response(JSON.stringify({ success: true, task: newTask }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } finally {
    await prisma.$disconnect();
  }
}