const dreamsList = document.getElementById('container');
const deleteButton = document.getElementById('delete');
let dreams = [];

const getDreamsListener = function() {
  dreams = JSON.parse(this.responseText);
  dreams.forEach(row => appendNewDream(row.dream, row.id));
}

const appendNewDream = function(dream, index) {
  const newListItem = document.createElement('li');
  newListItem.innerHTML = `<a class="cancela" href="/dreams/${index}">${dream}</a>`;
  newListItem.classList.add('item');
  const deleteButton = document.createElement('a');
  deleteButton.innerText = 'Delete';
  deleteButton.setAttribute('href', 'javascript:void(0)');
  deleteButton.setAttribute('id', index);
  deleteButton.classList.add('del');
  newListItem.appendChild(deleteButton);
  dreamsList.appendChild(newListItem);
  deleteButton.addEventListener('click', deleteDream);
}

const deleteDream = function (event) {
  const remDream = new XMLHttpRequest();
  //check what button delete request is coming from and make url
  const url = parseInt(this.id) ? `dreams/${this.id}` : location.pathname; 
  remDream.open('delete', url, true);
  remDream.send();
  remDream.onreadystatechange = () => {
    if (remDream.readyState === 4) {
      if (remDream.status === 200 && remDream.responseText === 'OK') {
        console.log('yay');
        //if remove request successful, reload the page (to show flash msg)
        window.location.pathname = '/';
      } else console.log('nay');
    }
  }
};

// request the dreams from our app's sqlite database if it's index.html
if (dreamsList) {
  const dreamRequest = new XMLHttpRequest();
  dreamRequest.onload = getDreamsListener;
  dreamRequest.open('get', '/getDreams');
  dreamRequest.send();
}

//add listener to delete button if it's add_dream and it's not generated
if (deleteButton) {
  deleteButton.addEventListener('click', deleteDream);
}