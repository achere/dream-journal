const dreamsList = document.getElementById('container');
const deleteButton = document.getElementById('delete');
const date = document.getElementById('date');
const times = document.getElementsByClassName('time');
let dreams = [];

const getDreamsListener = function() {
  dreams = JSON.parse(this.responseText);
  dreams.forEach(appendDream);
  //dreams.forEach(row => appendNewDream(row.title, row._id));
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

const appendDream = dream => {
  const dreamEl = document.createElement('div');
  const title = document.createElement('span');
  const datetimes = document.createElement('span');
  const edit = document.createElement('a');
  const desc = document.createElement('p');
  console.log(dream.date, dream.timesince);
  title.innerText = dream.title;
  title.classList.add('title');
  datetimes.classList.add('datetimes');
  datetimes.innerText = ` - ${dream.date},  ${dream.timesince}-${dream.timeuntil}`;
  edit.innerText = 'Edit';
  edit.classList.add('cancela');
  edit.classList
  edit.setAttribute('href', `/dreams/${dream._id}`);
  desc.innerText = dream.description;
  dreamEl.appendChild(edit);
  dreamEl.appendChild(title);
  dreamEl.appendChild(datetimes);
  dreamEl.appendChild(desc);
  dreamsList.appendChild(dreamEl);
  if (parseInt(window.getComputedStyle(desc).height) >= 55) {
    desc.classList.add('expand');
    desc.dataset.expanded = 0;
    const readmore = document.createElement('span');
    readmore.classList.add('readmore');
    readmore.classList.add('link');
    readmore.innerText = 'Read More';
    dreamEl.appendChild(readmore);
    readmore.addEventListener('click', expandText);
  }
}

const expandText = function(event) {
  const text = this.parentNode.getElementsByClassName('expand')[0];
  if (parseInt(text.dataset.expanded)) {
    text.style.maxHeight = '55px';
    text.dataset.expanded = 0;
    this.innerText = 'Read More';
  } else {
    text.style.maxHeight = 'none';
    text.dataset.expanded = 1;
    this.innerText = 'Show Less';
  }
};

const deleteDream = function(event) {
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
  dreamRequest.open('get', '/dreams/');
  dreamRequest.send();
}

//add listener to delete button if it's add_dream and it's not generated
if (deleteButton) {
  deleteButton.addEventListener('click', deleteDream);
}

//if there's date field
if (date) {
  const genDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth()+1}`.length == 1 ? `0${date.getMonth()+1}` : date.getMonth()+1;
    const day = `${date.getDate()}`.length == 1 ? `0${date.getDate()}` : date.getDate();
    return `${year}-${month}-${day}`;
  }
  if (!date.value) {    
    date.value = genDate();
  }
}

if (times[0]) {
  if (!times[0].value) times[0].value = '22:30';
  if (!times[1].value) times[1].value = '06:30';
}