document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;
  const postsContainer = document.getElementById('posts-container');
  const createPostBtn = document.getElementById('create-post-btn');
  const modal = document.getElementById('modal');
  const postForm = document.getElementById('post-form');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const closeBtn = document.querySelector('.close');
  let localPosts = [];
  let localUsers = {};
  let isEditMode = false;
  let currPostId = -1
  const loader = document.getElementById('loader');
  const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        // Класс body изменился, выполняем нужные действия
        const isDarkTheme = body.classList.contains('dark-theme');
        handleThemeChange(isDarkTheme);
      }
    }
  });
  observer.observe(body, { attributes: true, subtree: true });

  createPostBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', outsideClick);
  postForm.addEventListener('submit', function (e) {
    e.preventDefault();
    createOrUpdatePost();
  });
  themeToggleBtn.addEventListener('click', toggleTheme);

  function toggleTheme() {
    document.body.classList.toggle('dark-theme');
  }

  function handleThemeChange(isDarkTheme) {
    const body = document.body;
    const posts = document.querySelectorAll('.post');
    const postFormButton = document.querySelector('#post-form button');
    const createPostBtn = document.getElementById('create-post-btn');
    const themeBtn = document.getElementById('theme-toggle-btn');
    const modal = document.getElementById('modal');
    const modalContent = document.querySelector('.modal-content');
    const postFormInputs = document.querySelectorAll('#post-form input');
    const postFormTextarea = document.querySelector('#post-form textarea');
    const postFormSelect = document.querySelector('#post-form select');
    const postButtons = document.querySelectorAll('.post button');

    body.style.backgroundColor = isDarkTheme ? '#333' : '#f4f4f4';
    body.style.color = isDarkTheme ? '#fff' : "#333"

    posts.forEach(post => {
      post.style.border = isDarkTheme ? '3px solid mediumpurple' : '1px solid #ddd';
    });
    postFormButton.style.backgroundColor = isDarkTheme ? 'mediumpurple' : '#4caf50';

    createPostBtn.style.backgroundColor = isDarkTheme ? 'mediumpurple' : '#4caf50';
    themeBtn.style.backgroundColor = isDarkTheme ? 'mediumpurple' : '#4caf50';
    modal.style.backgroundColor = isDarkTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)';

    modalContent.style.backgroundColor = isDarkTheme ? '#333' : '#fefefe';
    modalContent.style.color = isDarkTheme ? '#fff' : 'inherit';
    modalContent.style.border = isDarkTheme ? '1px solid #777' : '1px solid #888';

    postFormInputs.forEach(input => input.style.backgroundColor = isDarkTheme ? '#444' : '#fff');
    postFormInputs.forEach(input => input.style.color = isDarkTheme ? '#fff' : '#444');

    postFormTextarea.style.backgroundColor = isDarkTheme ? '#444' : '#fff';
    postFormTextarea.style.color = isDarkTheme ? '#fff' : '#444';

    postFormSelect.style.backgroundColor = isDarkTheme ? '#444' : '#fff';
    postFormSelect.style.color = isDarkTheme ? '#fff' : '#444';

    postButtons.forEach(button => {
      button.style.backgroundColor = isDarkTheme ? '#616161' : '#008CBA';
    });
  }

  async function fetchUsers() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async function openModal() {
    modal.style.display = 'block';
    const userSelect = document.getElementById('user-select');

    const users = await fetchUsers();

    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.text = user.name;
      userSelect.appendChild(option);
    });
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  function outsideClick(e) {
    if (e.target === modal) {
      closeModal();
    }
  }

  function showLoader() {
    loader.style.display = 'block';
  }

  function hideLoader() {
    loader.style.display = 'none';
  }


  function createOrUpdatePost() {
    const titleInput = document.getElementById('title');
    const bodyInput = document.getElementById('body');
    const userSelect = document.getElementById('user-select');

    const title = titleInput.value;
    const body = bodyInput.value;
    const userId = userSelect.value;

    if (!title || !body || !userId || isNaN(userId) || userId < 1 || userId > 10) {
      alert('Добавьте действительные данные для заголовка, тела и идентификатора пользователя (от 1 до 10).');
      return;
    }

    if (isEditMode) {
      const postToUpdate = localPosts.find(post => post.id === currPostId);

      if (postToUpdate) {
        postToUpdate.title = title;
        postToUpdate.body = body;
        postToUpdate.userId = parseInt(userId);
      } else {
        alert('Пост не найден');
      }
    } else {
      const newPost = {
        id: localPosts.length + 1,
        title: title,
        body: body,
        userId: parseInt(userId)
      };

      localPosts.push(newPost);
    }

    displayPosts(localPosts);

    isEditMode = false;
    closeModal();
  }

  window.togglePostImportance = function togglePostImportance(postId) {
    const post = localPosts.find(post => post.id === postId);

    if (post) {
      post.isImportant = !post.isImportant;
      displayPosts(localPosts);
    } else {
      alert('Пост не найден');
    }
  }

  function fetchPosts() {
    showLoader();

    fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => response.json())
        .then(apiPosts => {
          localPosts = [...localPosts, ...apiPosts];
          displayPosts(localPosts);
          hideLoader();
        })
        .catch(error => {
          console.error('Error:', error);
          hideLoader();
        });
  }

  function fetchUserDetails(userId) {
    if (localUsers[userId]) {
      return Promise.resolve(localUsers[userId]);
    }

    return fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
        .then(response => response.json())
        .then(userDetails => {
          localUsers[userId] = userDetails;
          return userDetails;
        })
        .catch(error => {
          console.error('Error fetching user details:', error);
          return null;
        });
  }

  function displayPosts(posts) {
    posts.sort((a, b) => (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0));

    postsContainer.innerHTML = '';
    posts.forEach(async post => {
      const user = await fetchUserDetails(post.userId);

      const postElement = document.createElement('div');
      postElement.classList.add('post');
      if (post.isImportant) {
        postElement.classList.add('important-post');
      }
      postElement.innerHTML = `
                <div class="post-header">
                    <div class="star-btn ${post.isImportant ? 'important' : 'not-important'}" onclick="togglePostImportance(${post.id})">${post.isImportant ? '★' : '☆'}</div>
                    <h3>${post.title}</h3>
                </div>
                <p>${post.body}</p>
                <p>${user ? user.name : 'Unknown User'}</p>
                <button onclick="editPost(${post.id})">Редактировать</button>
                <button onclick="deletePost(${post.id})">Удалить</button>
            `;
      postsContainer.appendChild(postElement);
    });
  }

  fetchPosts();

  window.editPost = function (postId) {
    currPostId = postId
    const postToEdit = localPosts.find(post => post.id === postId);

    if (postToEdit) {
      const titleInput = document.getElementById('title');
      const bodyInput = document.getElementById('body');
      const userSelect = document.getElementById('user-select');

      console.log(postToEdit)
      titleInput.value = postToEdit.title;
      bodyInput.value = postToEdit.body;
      userSelect.value = postToEdit.userId;

      isEditMode = true;
      openModal();
    } else {
      alert('Пост не найден');
    }
  };
  window.deletePost = function (postId) {
    const postToDelete = localPosts.find(post => post.id === postId);

    if (!postToDelete) {
      alert('Пост не найден');
      return;
    }

    if (postToDelete.isImportant) {
      const confirmDeletion = confirm('Вы уверены, что хотите удалить важный пост?');

      if (!confirmDeletion) {
        return;
      }
    }

    localPosts = localPosts.filter(post => post.id !== postId);
    displayPosts(localPosts);
  };
});
