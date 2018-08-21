// client-side js
// run by the browser each time your view template referencing it is loaded

let dreams = [];

// define variables that reference elements on our page
const dreamsList = document.getElementById('container');
const deleteButton = document.getElementById('delete');

// a helper function to call when our request for dreams is done
const getDreamsListener = function() {
  // parse our response to convert to JSON
  dreams = JSON.parse(this.responseText);

  // iterate through every dream and add it to our page
  dreams.forEach(row => appendNewDream(row.dream, row.id));
}

// a helper function that creates a list item for a given dream
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

//when user hits delete, send request to server
const deleteDream = function (event) {
  const remDream = new XMLHttpRequest();
  //check what button delete request is coming from and make url
  const url = parseInt(this.id) ? `dreams/${this.id}` : location.pathname; 
  //remDream.open('delete', `/remDream?id=${this.id}`, true);
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

//add listener to delete button if there's one
if (deleteButton) {
  deleteButton.addEventListener('click', deleteDream);
}