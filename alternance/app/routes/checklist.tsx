import React from 'react';
import {
    Stack,
    Title,
    Text,
    Checkbox,
    Group,
    Container,
    Button,
    Table,
    Flex,
    Select,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { useState } from 'react';

function AddSubtaskButton({ taskId, handleShowAddSubtask }) {
    return (
      <Button
        style={{
          borderColor: "green",
          backgroundColor: "white",
          color: "green",
          fontWeight: "bold",
        }}
        onClick={() => {
          handleShowAddSubtask(taskId); // Pass only taskId
        }}
      >
        Add a subtask
      </Button>
    );
  }
function DeleteButton({ taskId }) {
    return (
        <Button color="red">Remove</Button>
    );
}

const tableData = {
    head: ["Title", "State", "Owner", "Description", ""],
    body: [
        [6, 12.011, "C", "Carbon", <AddSubtaskButton taskId={6} />, <DeleteButton taskId={6} />],
        [7, 14.007, "N", "Nitrogen", <AddSubtaskButton taskId={7} />, <DeleteButton taskId={7} />],
        [8, 88.906, "Y", "Yttrium", <AddSubtaskButton taskId={8} />, <DeleteButton taskId={8} />],
        [9, 137.33, "Ba", "Barium", <AddSubtaskButton taskId={9} />, <DeleteButton taskId={9} />],
        [10, 140.12, "Ce", "Cerium", <AddSubtaskButton taskId={10} />, <DeleteButton taskId={10} />],
        [11, 88.906, "Y", "Yttrium", <AddSubtaskButton taskId={11} />, <DeleteButton taskId={11} />],
        [12, 137.33, "Ba", "Barium", <AddSubtaskButton taskId={12} />, <DeleteButton taskId={12} />],
        [13, 140.12, "Ce", "Cerium", <AddSubtaskButton taskId={13} />, <DeleteButton taskId={13   } />],
    ],
};

export const meta: MetaFunction = () => {
    return [
        { title: "Kiosk Audit" },
        { name: "description", content: "The CSRD audit app by Kiosk" },
    ];
};

export const handle = {
    breadcrumb: () => "Checklist",
};



export default function Index() {
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [currentSubtask, setCurrentSubtask] = useState(null);

    const handleShowCreateTask = () => {
        setShowCreateTask(!showCreateTask);
        setCurrentSubtask(null);
    };

    const handleShowAddSubtask = (taskId, title) => {
        setCurrentSubtask(currentSubtask === taskId ? null : taskId);
        setShowCreateTask(false);
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
                        placeholder="Select an option"
                        data={["Owen", "Staline", "Namur", "Me"]}
                    />
                    <label htmlFor="name" style={{ marginRight: "5px" }}>State:</label>
                    <Select
                        placeholder="Select an option"
                        data={["NotOk", "--", "Ok"]}
                    />
                    <label htmlFor="name" style={{ marginRight: "5px" }}>Name:</label>
                    <input type="text" id="name" name="name" style={{ flex: 1 }} />
                </form>
            </div>
            <div style={{ overflow: "scroll", width: "100%", padding: "5px", height: "300px" }}>
                <Table>
                    <thead>
                        <tr>
                            {tableData.head.map((head, index) => (
                                <th key={index}>{head}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.body.map(([taskId, state, owner, description], index) => (
                            <tr key={index} style={{ textAlign: "center" }}>
                                <td>{description}</td>
                                <td>{state}</td>
                                <td>{owner}</td>
                                <td>{description}</td>
                                <td>
                                    <AddSubtaskButton
                                        taskId={taskId}
                                        title={description}
                                        onClick={handleShowAddSubtask}
                                    />
                                </td>
                                <td>
                                    <DeleteButton taskId={taskId} />
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
                        <form style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                            <label htmlFor="name" style={{ marginRight: "5px" }}>Title: </label>
                            <input type="text" id="name" name="name" style={{ flex: 1 }} />
                            <label htmlFor="name" style={{ marginRight: "5px" }}>State: </label>
                            <Select
                                placeholder="Select an option"
                                data={["To Do", "Doing", "Done"]}
                            />
                            <label htmlFor="name" style={{ marginRight: "5px" }}>Owner: </label>
                            <Select
                                placeholder="Select an option"
                                data={["Tandori", "Donny", "Pohl"]}
                            />
                            <label htmlFor="name" style={{ marginRight: "5px" }}>Description: </label>
                            <textarea cols={30}>
                            </textarea>
                        </form>
                    </div>
                    <Button variant="light" color="green" radius="md" style={{ fontWeight: "bold", width: "120px", borderStyle: "solid", borderColor: "green", marginLeft: "100px" }}>
                        <Text size="20px">Register</Text>
                    </Button>
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
                                data={["To Do", "Done"]}
                            />
                        </form>
                    </div>
                    <span style={{ margin: "5px", borderColor: "red", borderStyle: "solid", padding: "12px", borderWidth: "2px", borderRadius: "5px" }}>Principal task : <span style={{ color: "red" }}>{tableData.body.find(row => row[0] === currentSubtask)?.[3]} {/* Find and display the title of the selected task */}
                    </span></span>
                    <Button variant="light" color="green" radius="md" style={{ fontWeight: "bold", width: "120px", borderStyle: "solid", borderColor: "green", marginLeft: "100px" }}>
                        <Text size="20px">Register</Text>
                    </Button>
                </div>
            )}
        </Stack>
    );
}

