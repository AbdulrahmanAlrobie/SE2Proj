import { auth, db, ref, onValue } from '../firebaseConfig.js';

// Check if the user's name, avatar, display color, and background are stored in localStorage
const storedName = localStorage.getItem('userDisplayName');
const storedAvatar = localStorage.getItem('userAvatar');
const storedDisplayColor = localStorage.getItem('userDisplayColor');
const storedBackground = localStorage.getItem('userBackground');

const userInfo = document.getElementById('user-info');

if (storedName) {
  // If the user's name is stored, use it
  userInfo.innerHTML = `       
    <a href="account.html" id="account">
      <img src="${storedAvatar}" alt="User Avatar" id="user-avatar" style="background-color: ${storedBackground}">
      ${storedName}
    </a>
    <button id="sign-out-btn" class="btn">Sign out</button>
  `;
  document.getElementById('account').style.color = storedDisplayColor;
} else {
  // If the user's name is not stored, show the default state
  userInfo.innerHTML = `
    <a href="auth.html?form=login" id="log-in">Log in</a>
    <button id="sign-up-btn" class="btn" onclick="window.location.href ='auth.html?form=signup'">Sign up</button>
  `;
}

// Add event listener for the "Sign out" button using event delegation
userInfo.addEventListener('click', e => {
  if (e.target.id === 'sign-out-btn') {
    auth
      .signOut()
      .then(() => {
        // Clear the user's name from localStorage when they sign out
        localStorage.removeItem('userDisplayName');
        localStorage.removeItem('userAvatar');
        localStorage.removeItem('userDisplayColor');
        localStorage.removeItem('userBackground');
        location.reload();
      })
      .catch(error => {
        alert(error.message);
      });
  }
});

auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in.
    const userRef = ref(db, 'userSettings/' + user.uid);

    // Listen for changes in the user's data
    onValue(userRef, snapshot => {
      const data = snapshot.val();
      const userDisplayName = data.displayName;
      const userDisplayColor = data.displayColor;
      const userAvatar = data.avatar;
      const userBackground = data.avatarBackground;
      // Store the user's name, avatar, display color, and background in localStorage
      localStorage.setItem('userDisplayName', userDisplayName);
      localStorage.setItem('userAvatar', userAvatar);
      localStorage.setItem('userDisplayColor', userDisplayColor);
      localStorage.setItem('userBackground', userBackground);
      userInfo.innerHTML = `
        <a href="account.html" id="account">
          <img src="${userAvatar}" alt="User Avatar" id="user-avatar" style="background-color: ${userBackground}">
          ${userDisplayName}
        </a>
        <button id="sign-out-btn" class="btn">Sign out</button>
      `;
      document.getElementById('account').style.color = userDisplayColor;
    });
  } else {
    // User is not signed in.
    userInfo.innerHTML = `
      <a href="auth.html?form=login" id="log-in">Log in</a>
      <button id="sign-up-btn" class="btn" onclick="window.location.href ='auth.html?form=signup'">Sign up</button>
    `;
  }
});
