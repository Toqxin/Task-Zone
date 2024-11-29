chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.getAll((alarms) => {
    alarms.forEach((alarm) => {
      chrome.alarms.clear(alarm.name);
    });
  });
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  chrome.storage.local.get({tasks: []}, function(result) {
    let tasks = result.tasks || [];
    let task = tasks.find(t => t.task === alarm.name);
    if (task) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'img/todolist.png',
        title: 'Task Notification',
        message: `Task: ${task.task}\nDate: ${new Date(task.time).toLocaleString()}`,
        priority: 2
      }, function(notificationId) {
        console.log(`Notification ${notificationId} shown for task: ${task.task}`);
      });

      chrome.windows.create({
        url: `notification.html?message=${encodeURIComponent(task.task)}`,
        type: 'popup',
        width: 400,
        height: 200,
        left: 0,
        top: 0
      });
    }
  });
});
