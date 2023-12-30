import { auth } from '../js/auth.js';

auth.onAuthStateChanged(function(user) {
  var userInfo = document.getElementById('user-info');
  if (user) {
    // User is signed in.
    userInfo.innerHTML = `
      <a href="account.html" id="account">Account</a>
      <button id="sign-out-btn" class="link-navbar">Sign out</button>
    `;
    document.getElementById('sign-out-btn').addEventListener('click', function() {
      auth.signOut().then(() => {
       
      }).catch((error) => {
        alert(error.message);
      });
    });
  } else {
    // User is not signed in.
    userInfo.innerHTML = `
      <a href="auth.html?form=login" id="log-in">Log in</a>
      <button id="sign-up-btn" class="link-navbar" onclick="window.location.href ='auth.html?form=signup'">Sign up</button>
    `;
  }
});
