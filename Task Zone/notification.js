document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const taskMessage = urlParams.get('message');
  const notificationMessage = document.getElementById('notification-message');
  const currentTimeElement = document.getElementById('current-time');
  const imageShake = document.querySelector('.shake');

  imageShake.addEventListener('click', () => {
    imageShake.classList.remove('shake');
    void imageShake.offsetWidth;
    imageShake.classList.add('shake');
  });

  if (taskMessage) {
    notificationMessage.innerHTML = decodeURIComponent(taskMessage);
  }

  function updateTime() {
    currentTimeElement.textContent = new Date().toLocaleString();
  }
  setInterval(updateTime, 1000);
  updateTime();

  let audio = new Audio('sounds/bell2.mp3');
  audio.volume = 1;
  audio.play();

  function adjustWindowSize() {
    window.resizeTo(400, 500);
  }

  adjustWindowSize();
  setTimeout(() => {
    window.close();
  }, 20000);
});
