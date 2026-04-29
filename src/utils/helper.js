export const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  };

 export const dummyTasks = Array.from({ length: 1000 }, (_, i) => ({
  id: Math.floor(Math.random() * 1000000),
  text: `Task ${i + 1}`,
  columnId: 1
}));

export const dummyColumns = [
    {
      id: 1,
      name: "To Do",
      tasks: [],
      bgColor: "#e3f2fd",
    },
    {
      id: 2,
      name: "In Progress",
      tasks: [],
        bgColor: "#fff3e0",
    },
    {
      id: 3,
      name: "Done",
      tasks: [],
      bgColor: "#c8e6c9",
    },
  ];