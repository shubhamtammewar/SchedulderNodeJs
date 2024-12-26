// server.js
const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');

// Middleware to parse JSON requests 
app.use(bodyParser.json());


//Task List
let tasks = [], intervals = [];

// Throttle scheduleTasks Call
let debounceTimer;
const debounceScheduleTasks = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(scheduleTasks, 1800);
};

// Function to execute tasks
const executeTask = (task) => {
   console.log(`Executing Task: ${task.name}`);
   // we can add here task execution logic here.
};

// Schedule tasks
const scheduleTasks = () => {  
  // Clear existing intervals
  intervals.forEach(clearInterval);
  intervals = [];
    tasks.forEach(task =>{
      if (!task.schedule || task.schedule <= 0) {
        console.error(`Invalid schedule for task: ${task.name}`);
        return;
      }
      const intervalId = setInterval(() => {
            executeTask(task);
        },task.schedule);

    // Store the interval ID
     intervals.push(intervalId);
    });
};


// Route to add a new task 
app.post('/task', (req, res)=>{
    const {name, schedule, description } = req.body;
    // Throw error where in case of name and schedule is missing
    if (!name || !schedule ) {
        return res.status(400).send('Both name and schedule are required!');
    };
    if (typeof schedule !== 'number' || schedule <= 0) {
      return res.status(400).send('Schedule must be a positive number (milliseconds).');
    }
    
    const task = {
        id: tasks.length + 1,
        name,
        schedule,
        description
    };
    tasks.push(task);
    debounceScheduleTasks();
    res.status(201).json(task);
});

// Route to edit a task
app.put('/task/:id',(req, res)=>{
   const taskId = parseInt(req.params.id);
   const { name, schedule, description } = req.body;
   // further step to find the task to be edited from tasks list
   const taskIndex = tasks.findIndex(task => task.id === taskId);
   if (taskIndex === -1){
    return res.status(404).send('Task not found.');
   }
   if (!name || !schedule){
    return res.status(400).send('Both name and schedule are required!');
   }
   if (typeof schedule !== 'number' || schedule <= 0) {
    return res.status(400).send('Schedule must be a positive number (milliseconds).');
  }
  
   tasks[taskIndex] = {
      ...tasks[taskIndex],
      name,
      schedule,
      description,
   };
   debounceScheduleTasks();
   res.json(tasks[taskIndex]);
});

// Route to delete a task
app.delete('/task/:id',(req, res)=>{
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).send('Task not found');
  };
  const deletedTask = tasks.splice(taskIndex,1);
  debounceScheduleTasks();
  res.json(deletedTask[0]);
});

// Route to get all tasks
app.get('/tasks', (req,res)=>{
   res.json(tasks);
});

// Route to get a task by ID
app.get('/task/:id',(req,res)=>{
    const taskId = parseInt(req.params.id);
    const task = tasks.find(task => task.id === taskId);
    if (task) {
      res.json(task);
    } else {
      res.status(404).send('Task not found');
    }
}); 

// Start the scheduler
debounceScheduleTasks();


// Start the server
app.listen(port, ()=>{
  console.log(`Task scheduler app listening at http://localhost:${port}`);
});



