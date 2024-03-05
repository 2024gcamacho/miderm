let titleInput = document.getElementById('title');
let descInput = document.getElementById('desc');
let todoId = document.getElementById('todo-id');
let titleEditInput = document.getElementById('title-edit');
let descEditInput = document.getElementById('desc-edit');
let todos = document.getElementById('todos');
let data = [];
let selectedTodo = {};
const api = 'http://127.0.0.1:8000';

function tryAdd() {
  let msg = document.getElementById('msg');
  msg.innerHTML = '';
}

document.getElementById('form-add').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!titleInput.value) {
    document.getElementById('msg').innerHTML = 'Todo cannot be blank';
  } else {
    addTodo(titleInput.value, descInput.value);

    let add = document.getElementById('add');
    add.setAttribute('data-bs-dismiss', 'modal');
    add.click();
    (() => {
      add.setAttribute('data-bs-dismiss', '');
    })();
  }
});

let addTodo = (title, description) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 201) {
      const newTodo = JSON.parse(xhr.responseText);
      data.push(newTodo);
      refreshTodos();
    }
  };
  xhr.open('POST', `${api}/todos`, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ title, description }));
};

let refreshTodos = () => {
  todos.innerHTML = '';
  data
    .sort((a, b) => b.id - a.id)
    .forEach((todo) => {
      const dateValue = todo.title;
      
      const dateComponents = dateValue.split('-');
      const dateObject = new Date(Date.UTC(dateComponents[0], dateComponents[1] - 1, dateComponents[2], 12));

      if (!isNaN(dateObject)) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let formattedDate = dateObject.toLocaleDateString('en-US', options);

        const day = dateObject.getUTCDate();
        const ordinal = getOrdinalSuffix(day);
        formattedDate = formattedDate.replace(day, `${day}${ordinal}`);

        todos.innerHTML += `
        <div id="todo-${todo.id}">
          <span class="fw-bold fs-4">${formattedDate}</span>
          <pre class="text-secondary ps-3">${todo.description}</pre>
          <span class="options">
            <button onClick="tryEditTodo(${todo.id})" data-bs-toggle="modal" data-bs-target="#modal-edit" class="btn btn-primary">Edit</button>
            <button onClick="deleteTodo(${todo.id})" class="btn btn-danger">Delete</button>
          </span>
        </div>
      `;
      
      } else {
        todos.innerHTML += `
          <div id="todo-${todo.id}">
            <span class="fw-bold fs-4">Invalid Date</span>
            <pre class="text-secondary ps-3">${todo.description}</pre>
            <span class="options">
              <i onClick="tryEditTodo(${todo.id})" data-bs-toggle="modal" data-bs-target="#modal-edit" class="fas fa-edit"></i>
              <i onClick="deleteTodo(${todo.id})" class="fas fa-trash-alt"></i>
            </span>
          </div>
        `;
      }
    });
  resetForm();
};


function getOrdinalSuffix(i) {
  var j = i % 10,
      k = i % 100;
  if (j == 1 && k != 11) {
      return "st";
  }
  if (j == 2 && k != 12) {
      return "nd";
  }
  if (j == 3 && k != 13) {
      return "rd";
  }
  return "th";
}

let tryEditTodo = (id) => {
  const todo = data.find((x) => x.id === id);
  selectedTodo = todo;
  todoId.innerText = todo.id;
  titleEditInput.value = todo.title; 
  
  const dateObject = new Date(todo.title);
  if (!isNaN(dateObject)) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObject.toLocaleDateString('en-US', options);
    const day = dateObject.getDate();
    const formattedDay = day + getOrdinalSuffix(day);
    const finalDate = formattedDate.replace(day.toString(), formattedDay);
    
    document.getElementById('formattedDateDisplay').innerText = finalDate;
  } else {
    document.getElementById('formattedDateDisplay').innerText = 'Invalid date';
  }
  
  descEditInput.value = todo.description;
  document.getElementById('msg').innerHTML = '';
};
// When the user clicks on the button, toggle between hiding and showing the dropdown content
document.querySelector(".dropbtn").onclick = function() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}



document.getElementById('form-edit').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!titleEditInput.value) {
    msg.innerHTML = 'Todo cannot be blank';
  } else {
    editTodo(titleEditInput.value, descEditInput.value);

    let edit = document.getElementById('edit');
    edit.setAttribute('data-bs-dismiss', 'modal');
    edit.click();
    (() => {
      edit.setAttribute('data-bs-dismiss', '');
    })();
  }
});
let editTodo = (title, description) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      selectedTodo.title = title;
      selectedTodo.description = description;
      refreshTodos();
    }
  };
  xhr.open('PUT', `${api}/todos/${selectedTodo.id}`, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify({ title, description }));
};

let deleteTodo = (id) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = data.filter((x) => x.id !== id);
      refreshTodos();
    }
  };
  xhr.open('DELETE', `${api}/todos/${id}`, true);
  xhr.send();
};

let resetForm = () => {
  titleInput.value = '';
  descInput.value = '';
};

let getTodos = () => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      data = JSON.parse(xhr.responseText) || [];
      refreshTodos();
    }
  };
  xhr.open('GET', `${api}/todos`, true);
  xhr.send();
};

(() => {
  getTodos();
})();
