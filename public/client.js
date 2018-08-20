// client-side js
// run by the browser each time your view template referencing it is loaded

let dreams = [];

// define variables that reference elements on our page
const dreamsList = document.getElementById('dreams');
//const dreamsForm = document.forms[0];
//const dreamInput = dreamsForm.elements['dream'];

// a helper function to call when our request for dreams is done
const getDreamsListener = function() {
  // parse our response to convert to JSON
  dreams = JSON.parse(this.responseText);

  // iterate through every dream and add it to our page
  //dreamsList.innerHTML = '';
  dreams.forEach(row => appendNewDream(row.dream, row.id));
}

// a helper function that creates a list item for a given dream
const appendNewDream = function(dream, index) {
  const newListItem = document.createElement('li');
  newListItem.innerText = dream + ' - ';
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
  remDream.open('delete', `/remDream?id=${this.id}`, true);
  remDream.send();
  remDream.onreadystatechange = () => {
    if (remDream.readyState === 4) {
      if (remDream.status === 200 && remDream.responseText === 'OK') {
        console.log('yay');
        //if remove request successful, reload the page (to show flash msg)
        window.location.reload(false);
        //event.target.parentNode.remove();
      } else console.log('nay');
    }
  }
};

// request the dreams from our app's sqlite database
const dreamRequest = new XMLHttpRequest();
dreamRequest.onload = getDreamsListener;
dreamRequest.open('get', '/getDreams');
dreamRequest.send();