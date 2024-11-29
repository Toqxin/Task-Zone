document.getElementById('add-task').addEventListener('click', function() {
  let audioClick = new Audio('sounds/click.mp3');
  audioClick.volume = 0.05;
  audioClick.play();

  let taskInput = document.getElementById('task');
  let timeInput = document.getElementById('task-time');
  let task = taskInput.value;
  let time = timeInput.value;

  let wordCount = task.split(' ').filter(Boolean).length;
  if (wordCount > 50 || task.length > 200){
    alert('The task can be maximum 50 words!');
    return;
  }

  if (task && time) {
    chrome.storage.local.get({tasks: []}, function(result) {
      let tasks = result.tasks || [];
      tasks.push({task: task, time: time, completed: false});
      chrome.storage.local.set({tasks: tasks}, function() {
        let alarmTime = new Date(time).getTime();
        chrome.alarms.create(task, {when: alarmTime});
        console.log(`Alarm set for task: ${task} at ${new Date(alarmTime).toLocaleString()}`);
        renderTasks();

      });
    });
  }
  taskInput.value = '';
  timeInput.value = '';
});

const colorPicker = document.getElementById('color-picker');
const todoList = document.getElementById('todo-list');

chrome.storage.local.get(['backgroundColor'], function(result){
  if (result.backgroundColor){
    todoList.style.backgroundColor = result.backgroundColor;
    colorPicker.value = result.backgroundColor;
  }
});

colorPicker.addEventListener('input', (event)=>{
  const selectedColor = event.target.value;
  todoList.style.backgroundColor = selectedColor;
  chrome.storage.local.set({backgroundColor:selectedColor});
});

document.getElementById('report-icon').addEventListener('click', function() {
  chrome.storage.local.get({tasks: []}, function(result) {
    let tasks = result.tasks || [];
    if (tasks.length === 0) {
      return;
    }
    window.open('report.html');
  });
});

function renderTasks() {
  chrome.storage.local.get({ tasks: [] }, function (result) {
    let tasks = result.tasks || [];
    let tasksList = document.getElementById('tasks');
    const taskHeader = document.getElementById("task-header");
    const progressContainer = document.getElementById("progress");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    const prg = document.getElementById('progress');
    tasksList.innerHTML = '';

    let currentTime = new Date().getTime();
    tasks.forEach(function (task) {
      if (new Date(task.time).getTime() < currentTime) {
        task.completed = true;
      }
    });

    let completedTasks = tasks.filter(task => task.completed);
    let pendingTasks = tasks.filter(task => !task.completed);

    if (tasks.length > 0) {
      taskHeader.classList.remove("hidden");
      taskHeader.classList.add("visible");
      progressContainer.classList.remove("hidden-progress-bar");
      progressContainer.classList.add("visible");
      taskHeader.innerHTML = `Total tasks ${tasks.length}`;

      let tooltipContent = `
        <div>Pending: <span style="color: gray;">${pendingTasks.length}</span></div>
        <div>Completed: <span style="color: gray;">${completedTasks.length}</span></div>
      `;

      if (!document.querySelector('.tooltip')) {
        let tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = tooltipContent;
        taskHeader.appendChild(tooltip);
      } else {
        document.querySelector('.tooltip').innerHTML = tooltipContent;
      }

      prg.style.display = 'flex';
      let completionPercentage = (completedTasks.length / tasks.length) * 100;
      progressBar.style.width = `${completionPercentage}%`;
      progressText.textContent = `${Math.round(completionPercentage)}%`;

    } else {
      taskHeader.classList.remove("visible");
      taskHeader.classList.add("hidden");
      tasksList.innerHTML = '<li id="no-tasks-message">Your tasks</li>';

      prg.style.display = 'none';
      progressBar.style.width = '0%'; 
      progressText.textContent = '0%'; 
    }

    tasks.forEach(function (task, index) {
      let li = document.createElement('li');
      li.style.textAlign = 'left';
      li.style.listStyleType = 'none';
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';

      let taskContainer = document.createElement('div');
      taskContainer.style.display = 'flex';
      taskContainer.style.flexDirection = 'column';

      let taskSpan = document.createElement('span');
      taskSpan.textContent = task.task;
      taskSpan.style.fontSize = '17px';

      let timeSpan = document.createElement('span');
      let taskDate = new Date(task.time);
      timeSpan.textContent = taskDate.toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      timeSpan.style.backgroundColor = '#f7dead';
      timeSpan.style.fontSize = '0.8em';
      timeSpan.style.boxShadow = '0px 2px 2px rgba(0, 0, 0, 0.4), 0px 7px 13px -3px rgba(0, 0, 0, 0.3), 0px -3px 0px rgba(0, 0, 0, 0.2) inset';
      timeSpan.style.padding = '2px';
      timeSpan.style.fontFamily = 'monospace';
      timeSpan.style.width = '140px';
      timeSpan.style.marginTop = '5px';
      timeSpan.style.borderRadius = '1px';

      let deleteButton = document.createElement('button');
      deleteButton.id = 'delete-task-' + index;
      deleteButton.className = 'delete-task';
      deleteButton.textContent = 'Del';
      deleteButton.style.width = '50px';
      deleteButton.style.backgroundColor = 'red';
      deleteButton.style.color = 'white';
      deleteButton.style.border = '2px solid black';
      deleteButton.style.padding = '0px';
      deleteButton.style.marginTop = '5px';
      deleteButton.style.borderRadius = '4px';
      deleteButton.style.cursor = 'pointer';
      deleteButton.addEventListener('click', function () {
        let audio2 = new Audio('sounds/bell3.mp3');
        audio2.volume = 0.05;
        audio2.play();
        deleteTask(index);
      });

      if (task.completed || new Date(task.time).getTime() < currentTime) {
        taskSpan.style.textDecoration = 'line-through';
        taskSpan.style.textDecorationThickness = '2px';
        li.style.backgroundColor = '#D0F0C0';
      } else {
        li.style.backgroundColor = 'white';
      }

      taskContainer.appendChild(taskSpan);
      taskContainer.appendChild(timeSpan);

      if (new Date(task.time).getTime() >= currentTime) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-div';
        statusDiv.style.width = '19px';
        statusDiv.style.height = '19px';
        statusDiv.style.border = '2px solid black';
        statusDiv.style.borderRadius = '4px';
        statusDiv.style.marginTop = '10px';
        statusDiv.style.backgroundColor = task.completed ? 'green' : '#C0C0C0';
        statusDiv.style.cursor = 'pointer';
        statusDiv.style.position = 'relative'; 

        const img = document.createElement('img');
        img.src = 'img/tic.png';
        img.alt = 'Completed';
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.position = 'absolute';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.transform = 'translate(-50%, -50%)';
        img.style.display = task.completed ? 'block' : 'none'; 

        statusDiv.appendChild(img); 

        statusDiv.addEventListener('click', function () {
          task.completed = !task.completed;
          statusDiv.style.backgroundColor = task.completed ? 'green' : '#C0C0C0';
          taskSpan.style.textDecoration = task.completed ? 'line-through' : 'none';
          img.style.display = task.completed ? 'block' : 'none'; 

          chrome.storage.local.set({ tasks: tasks }, function () {
            if (task.completed) {
              chrome.alarms.clear(task.task); 
            } else {
              let alarmTime = new Date(task.time).getTime();
              chrome.alarms.create(task.task, { when: alarmTime }); 
            }
            renderTasks();
          });
        });
        taskContainer.appendChild(statusDiv);
      }
      li.appendChild(taskContainer);
      li.appendChild(deleteButton);
      tasksList.appendChild(li);
    });
    chrome.storage.local.set({ tasks: tasks });
  });
}

function deleteTask(taskIndex) {
  chrome.storage.local.get({tasks: []}, function(result) {
    let tasks = result.tasks || [];
    let taskToDelete = tasks[taskIndex];
    tasks.splice(taskIndex, 1); 
    chrome.storage.local.set({tasks: tasks}, function() {
      chrome.alarms.clear(taskToDelete.task);
      renderTasks();
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  renderTasks();
  setInterval(renderTasks, 2000);

  const taskInput = document.getElementById("task");
  const taskTimeInput = document.getElementById("task-time");
  const addButton = document.getElementById("add-task");
  const zColor = document.getElementById('z-span');

  function checkInputs() {
    if (taskInput.value.trim() !== "" || taskTimeInput.value.trim() !== "") {
      zColor.classList.add('blink-animation');
    } else {
      zColor.classList.remove('blink-animation');
    }
  }

  function handleAddTask() {
    zColor.classList.remove('blink-animation');
  }
  taskInput.addEventListener("input", checkInputs);
  taskTimeInput.addEventListener("input", checkInputs);
  addButton.addEventListener("click", handleAddTask);
});

