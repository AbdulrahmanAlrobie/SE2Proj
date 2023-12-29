// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  set,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
// TODO: Add SDKs for db products that you want to use
// https://db.google.com/docs/web/setup#available-libraries

// Your web app's db configuration
// For db JS SDK v7.20.0 and later, measurementId is optional
const dbConfig = {
  apiKey: "AIzaSyD6ZB30EJWoiK3dHefpjHSIG1-2fsl4eYA",
  authDomain: "edunest-2d87c.dbapp.com",
  databaseURL:
    "https://edunest-2d87c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "edunest-2d87c",
  storageBucket: "edunest-2d87c.appspot.com",
  messagingSenderId: "661448680628",
  appId: "1:661448680628:web:26be9e0c2411ec25afe3e1",
  measurementId: "G-MPQR8L0QLZ",
};

// Initialize db
const app = initializeApp(dbConfig);
const db = getDatabase();
// const dbRef = ref(db);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const loginBtn = document.querySelector("#login");
const forgotPassword = document.getElementById("forgot-password");
const signupBtn = document.querySelector("#signup");

// Slide animations:

window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const formToShow = urlParams.get("form");
  if (formToShow === "login") {
    document.getElementById("login").click();
  } else if (formToShow === "signup") {
    document.getElementById("signup").click();
  }
};

loginBtn.addEventListener("click", (e) => {
  let parent = e.target.parentNode.parentNode;
  Array.from(e.target.parentNode.parentNode.classList).find((element) => {
    if (
      element !== "slide-up" &&
      !signupBtn.parentNode.classList.contains("slide-up")
    ) {
      parent.classList.add("slide-up");
    } else if (element === "slide-up") {
      signupBtn.parentNode.classList.add("slide-up");
      parent.classList.remove("slide-up");
    }
  });
});

signupBtn.addEventListener("click", (e) => {
  let parent = e.target.parentNode;
  Array.from(e.target.parentNode.classList).find((element) => {
    if (
      element !== "slide-up" &&
      !loginBtn.parentNode.parentNode.classList.contains("slide-up")
    ) {
      parent.classList.add("slide-up");
    } else if (element === "slide-up") {
      loginBtn.parentNode.parentNode.classList.add("slide-up");
      parent.classList.remove("slide-up");
    }
  });
});

// Authentication logic:
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signupEmail.value;
  const password = signupPassword.value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      window.location.href = "./index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

forgotPassword.addEventListener("click", function (e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Password reset email sent!");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
      alert(errorMessage);
    });
});

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signupEmail.value;
  const password = signupPassword.value;
  const displayName = document.getElementById("sign-up-display-name").value;
  const username = document.getElementById("sign-up-username").value;

  get(ref(db, "usernames/" + username)).then((snapshot) => {
    if (snapshot.exists()) {
      alert("This username is already taken. Please choose a different one.");
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;

          set(ref(db, "users/" + user.uid), {
            username: username,
            displayName: displayName ?? username,
            email: email,
            role: "user",
          });
          set(ref(db, "usernames/" + username), user.uid);

          window.location.href = "./index.html";
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  });
});
