import { auth, db, } from "../js/auth.js";
import { ref, onValue, } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";


auth.onAuthStateChanged(function (user) {
  const userInfo = document.getElementById("user-info");

  if (user) {
    // User is signed in.
    const userRef = ref(db, 'users/' + user.uid);

    // Listen for changes in the user's data
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      const userDisplayName = data.displayName;

      // Update the UI
      userInfo.innerHTML = `
        <a href="account.html" id="account">${userDisplayName}</a>
        <button id="sign-out-btn" class="link-navbar">Sign out</button>
      `;
      document
        .getElementById("sign-out-btn")
        .addEventListener("click", function () {
          auth
            .signOut()
            .then(() => { })
            .catch((error) => {
              alert(error.message);
            });
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
