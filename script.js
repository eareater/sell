// Define file and user data as shown in the previous code

// Helper function to display file information
function displayFileList(files) {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';

  files.forEach(file => {
    const listItem = document.createElement('li');
    const fileImage = document.createElement('img');
    fileImage.src = 'file-icon.png'; // Replace with your file icon image
    fileImage.alt = 'File Icon';
    const fileInfo = document.createElement('div');
    fileInfo.classList.add('file-info');
    const fileName = document.createElement('span');
    fileName.textContent = file.name;
    const filePrice = document.createElement('span');
    filePrice.classList.add('file-price');
    filePrice.textContent = `${file.price} Coins`;
    const downloadButton = document.createElement('a');
    downloadButton.href = `/purchase/${file._id}`;
    downloadButton.textContent = 'Download';
    downloadButton.setAttribute('download', '');
    downloadButton.setAttribute('target', '_blank');

    fileInfo.appendChild(fileImage);
    fileInfo.appendChild(fileName);
    listItem.appendChild(fileInfo);
    listItem.appendChild(filePrice);
    listItem.appendChild(downloadButton);
    fileList.appendChild(listItem);
  });
}

// Helper function to display user information
function displayUserInfo(username, balance) {
  const userInfo = document.getElementById('user-info');
  userInfo.textContent = `Logged in as ${username}. Balance: ${balance} Coins`;
}

// Helper function to display error message
function displayErrorMessage(message) {
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = message;
}

// Handle login form submission
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', event => {
  event.preventDefault();
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  const formData = new FormData();
  formData.append('username', usernameInput.value);
  formData.append('password', passwordInput.value);

  fetch('/login', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (response.ok) {
        window.location.href = '/files';
      } else if (response.status === 401) {
        displayErrorMessage('Invalid username or password.');
      } else {
        displayErrorMessage('An error occurred. Please try again later.');
      }
    })
    .catch(error => {
      console.error(error);
      displayErrorMessage('An error occurred. Please try again later.');
    });
});

// Handle logout button click
const logoutButton = document.getElementById('logout-btn');
logoutButton.addEventListener('click', () => {
  fetch('/logout')
    .then(response => {
      if (response.ok) {
        window.location.href = '/';
      } else {
        displayErrorMessage('An error occurred. Please try again later.');
      }
    })
    .catch(error => {
      console.error(error);
      displayErrorMessage('An error occurred. Please try again later.');
    });
});

// Fetch file list and user info on the files page
if (window.location.pathname === '/files') {
  fetch('/files')
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        displayErrorMessage('An error occurred. Please try again later.');
      }
    })
    .then(data => {
      if (data) {
        displayFileList(data.files);
        displayUserInfo(data.username, data.balance);
      }
    })
    .catch(error => {
      console.error(error);
      displayErrorMessage('An error occurred. Please try again later.');
    });
}
