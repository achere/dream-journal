const messages = document.getElementsByClassName('mssg');
const removeMsg = function(event) {
  event.target.remove();
};
[...messages].forEach((msg) => msg.addEventListener('click', removeMsg));