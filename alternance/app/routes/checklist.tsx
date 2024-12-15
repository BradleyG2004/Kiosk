import React, { useState, useEffect } from 'react';
import {
    Stack,
    Title,
    Text,
    Button,
    Table,
    Flex,
    Select,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { FormEvent } from 'react';
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader() {
    try {
        const users = await prisma.user.findMany();
        const tasks = await prisma.task.findMany({
            include: { owner: true }
        });
        return json({ users, tasks });
    } catch (error) {
        console.error('Loader error:', error);
        return json({ users: [], tasks: [] }, { status: 500 });
    }
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    try {
        switch (intent) {
            case 'create-task': {
                const task = await prisma.task.create({
                    data: {
                        title: formData.get('title') as string,
                        state: formData.get('state') as string,
                        description: formData.get('description') as string,
                        owner: {
                            connect: {
                                id: Number(formData.get('ownerId'))
                            }
                        }
                    }
                });
                return json({ success: true, task });
            }
            case 'delete-task': {
                const taskId = Number(formData.get('taskId'));
                await prisma.task.delete({
                    where: { id: taskId }
                });
                return json({ success: true });
            }
            default:
                return json({ success: false, message: 'Invalid intent' });
        }
    } catch (error) {
        console.error('Action error:', error);
        return json({ success: false, error: String(error) }, { status: 500 });
    }
}

interface TaskFormData {
    title: string;
    state: string;
    description: string;
    ownerId: number;
}

export const meta: MetaFunction = () => {
    return [
        { title: "Kiosk Audit" },
        { name: "description", content: "The CSRD audit app by Kiosk" },
    ];
};

export const handle = {
    breadcrumb: () => "Checklist",
};

export default function ChecklistPage() {
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [currentSubtask, setCurrentSubtask] = useState<number | null>(null);
    const { users, tasks } = useLoaderData<typeof loader>();

    const prisma = new PrismaClient();

    const handleShowCreateTask = () => {
        setShowCreateTask(!showCreateTask);
    };

    const handleShowAddSubtask = (taskObject) => {
        setCurrentSubtask(taskObject); // Stocker l'objet tâche complet
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedUsers = await prisma.user.findMany();
                const fetchedTasks = await prisma.task.findMany({
                    include: { owner: true } // Include owner details
                });

                setUsers(fetchedUsers);
                setTasks(fetchedTasks);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleSubmitTask = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget as HTMLFormElement);
        const taskData: TaskFormData = {
            title: formData.get('name') as string,
            state: formData.get('state') as string,
            description: formData.get('description') as string,
            ownerId: parseInt(formData.get('owner') as string),
        };

        try {
            console.log("donneees" + JSON.stringify(taskData))
            const response = await fetch('/create-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            // const data = await response.json();

            if (!response.ok) {
                const errorData = await response.json(); // Parse the error response from the server
                alert(`Erreur lors de la création de la tâche : ${errorData.error}`);
            } else {
                alert('Tâche créée avec succès !');
                window.location.reload();
            }

        } catch (error) {
            console.error('Error creating task:', error);
            alert('Une erreur inattendue s\'est produite.');
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            const formData = new FormData();
            formData.append('intent', 'delete-task');
            formData.append('taskId', taskId.toString());

            const response = await fetch('', {  // Submit to the current route
                method: 'POST',
                body: formData
            });
            window.location.reload();
        } catch (error) {
            window.location.reload();
        }
    };

    return (
        <Stack style={{ margin: "10px" }}>
            <Flex direction="row" justify="space-between" align="center">
                <Title style={{ textAlign: "center" }}>All your tasks in one place</Title>
                <Button onClick={handleShowCreateTask} variant="light" color="green" radius="md" style={{ fontWeight: "bold", borderStyle: "solid", borderColor: "green" }}>
                    <Text size="20px">New Task +</Text>
                </Button>
            </Flex>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "20px", marginBottom: "20px", borderWidth: "2px", borderColor: "green", borderRadius: "5px", borderStyle: "solid", padding: "5px", width: "1000px" }}>
                <Text color="green" style={{ fontWeight: "bold" }}>Filter by:</Text>
                <form style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                    <label htmlFor="name" style={{ marginRight: "5px" }}>Owner:</label>
                    <Select
                        placeholder="Owner"
                        data={users.map(user => ({
                            label: `${user.firstName} ${user.lastName}`,
                            value: user.id.toString()
                        }))}
                    />
                    <label htmlFor="name" style={{ marginRight: "5px" }}>State:</label>
                    <Select
                        placeholder="State"
                        data={["TODO", "DOING", "DONE"]}
                    />
                    <label htmlFor="name" style={{ marginRight: "5px" }}>Name:</label>
                    <input type="text" id="name" name="name" style={{ flex: 1 }} />
                </form>
            </div>
            <div style={{ borderStyle: "solid", borderColor: "green", borderRadius: "5px", overflow: "scroll", width: "100%", padding: "10px", height: "300px" }}>
                <Table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>State</th>
                            <th>Owner</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id} style={{ textAlign: "center" }}>
                                <td>{task.title}</td>
                                <td>{task.state}</td>
                                <td>{`${task.owner.firstName} ${task.owner.lastName}`}</td>
                                <td>{task.description}</td>
                                <td>
                                    <Button
                                        onClick={() => handleShowAddSubtask(task)}
                                        variant="light"
                                        color="green"
                                        style={{ margin: "5px" }}
                                    >
                                        Add Subtask
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteTask(task.id)}
                                        color="red"
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            {showCreateTask && (
                <div id="ct" style={{ borderColor: "gray", borderRadius: "5px", borderStyle: "solid", borderWidth: "1px", backgroundColor: "#f5f5f5", padding: "5px", marginTop: "10px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "20px" }}>Create a task </span>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "20px", marginBottom: "20px", borderWidth: "2px", borderColor: "green", borderRadius: "5px", borderStyle: "solid", padding: "5px", marginLeft: "50px" }}>
                        <form onSubmit={handleSubmitTask} style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                            <label htmlFor="name" style={{ marginRight: "5px" }}>Title: </label>
                            <input type="text" id="name" name="name"
                                placeholder="Task Title"
                                required style={{ flex: 1 }} />
                            <label htmlFor="name" style={{ marginRight: "5px" }}>State: </label>
                            <Select
                                name="state"
                                label="State"
                                data={["TODO", "DOING", "DONE"]}
                                required
                            />
                            <label htmlFor="name" style={{ marginRight: "5px" }}>Owner: </label>
                            <Select
                                name="owner"
                                label="Owner"
                                data={users.map(user => ({
                                    label: `${user.firstName} ${user.lastName}`,
                                    value: user.id.toString()
                                }))}
                                required
                            />
                            <label htmlFor="name" style={{ marginRight: "5px" }}>Description: </label>
                            <textarea name="description"
                                placeholder="Task Description" cols={30}>
                            </textarea>
                            <Button type="submit" variant="light" color="green" radius="md" style={{ fontWeight: "bold", width: "120px", borderStyle: "solid", borderColor: "green", marginLeft: "100px" }}>
                                <Text size="20px">Register</Text>
                            </Button>
                        </form>
                    </div>
                </div>
            )}
            {currentSubtask !== null && (
                <div id="ast" style={{ borderColor: "gray", borderRadius: "5px", borderStyle: "solid", borderWidth: "1px", backgroundColor: "#f5f5f5", padding: "5px", marginTop: "10px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "20px" }}>Add a subtask </span>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "20px", marginBottom: "20px", borderWidth: "2px", borderColor: "green", borderRadius: "5px", borderStyle: "solid", padding: "5px", marginLeft: "50px" }}>
                        <form style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                            <label htmlFor="name" style={{ marginRight: "5px" }}>Title: </label>
                            <input type="text" id="name" name="name" style={{ flex: 1 }} />
                            <label htmlFor="name" style={{ marginRight: "5px" }}>State: </label>
                            <Select
                                placeholder="Select an option"
                                data={["TODO", "DONE"]}
                            />
                        </form>
                    </div>
                    <span style={{ margin: "5px", borderColor: "red", borderStyle: "solid", padding: "12px", borderWidth: "2px", borderRadius: "5px" }}>Principal task : <span style={{ color: "red" }}>{currentSubtask ? currentSubtask.title : 'N/A'}
                    </span></span>
                    <Button variant="light" color="green" radius="md" style={{ fontWeight: "bold", width: "120px", borderStyle: "solid", borderColor: "green", marginLeft: "100px" }}>
                        <Text size="20px">Register</Text>
                    </Button>
                </div>
            )}
            <div id="ast" style={{ borderColor: "gray", borderRadius: "5px", borderStyle: "solid", borderWidth: "1px", backgroundColor: "#f5f5f5", padding: "5px", marginTop: "10px" }}>
                <span style={{ fontWeight: "bold", fontSize: "20px", margin: "5px" }}>Subtask for : <span style={{ color: "green" }}>N1</span></span>
                <div style={{ overflow: "scroll", height: "200px" }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>State</th>
                                <th>Primary task</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ textAlign: "center" }}>
                                <td>description</td>
                                <td>state</td>
                                <td>owner</td>
                                <td>
                                    delete
                                </td>
                            </tr>
                            <tr style={{ textAlign: "center" }}>
                                <td>description1</td>
                                <td>state1</td>
                                <td>owner1</td>
                                <td>
                                    delete
                                </td>
                            </tr><tr style={{ textAlign: "center" }}>
                                <td>description2</td>
                                <td>state2</td>
                                <td>owner2</td>
                                <td>
                                    delete
                                </td>
                            </tr><tr style={{ textAlign: "center" }}>
                                <td>description3</td>
                                <td>state3</td>
                                <td>owner3</td>
                                <td>
                                    delete
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
        </Stack>
    );
}
