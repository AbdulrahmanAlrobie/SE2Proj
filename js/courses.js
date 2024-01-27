import {
  auth,
  db,
  get,
  onChildAdded,
  set,
  push,
  ref,
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL
} from '../firebaseConfig.js'

const courseModal = new bootstrap.Modal(document.getElementById('courseModal'))
// Get a reference to the courses container
const coursesContainer = document.getElementById('courses-container')

// Listen for changes in the courses data
const coursesRef = ref(db, 'courses')
onChildAdded(coursesRef, snapshot => {
  // Get the course data
  const course = snapshot.val()

  // Create a new div for the course
  const courseDiv = document.createElement('div')
  courseDiv.className = 'card'

  // Add the course details to the div
  courseDiv.innerHTML = `
        <img src="${course.image}" alt="${course.title}">
        <h5>${course.title}</h5>
        <div class="card-info">${course.description}</div>
    `

  // Create a large card for the course
  const largeCard = document.createElement('div')
  largeCard.className = 'large-card'
  largeCard.innerHTML = `
        <img src="${course.image}" alt="${course.title}">
        <div class="card-body">
            <h5 class="card-title">${course.title}</h5>
            <p class="card-text">${course.description}</p>
            <p class="card-text"><small class="text-muted">Created on ${course.created}</small></p>
            <button class="btn btn-primary enroll-btn">Enroll</button>
            <button class="btn btn-primary explore-btn">Explore</button>

        </div>
        <span class="exit-button">X</span>
    `

  // Show the large card when the course card is clicked
  courseDiv.addEventListener('click', () => {
    largeCard.classList.add('active')
  })

  
  largeCard.querySelector('.explore-btn').addEventListener('click', () => {
      window.location.href = `./courses/index.html?course=${encodeURIComponent(course.title)}`
  })

  // Hide the large card when the exit button is clicked
  largeCard.querySelector('.exit-button').addEventListener('click', () => {
    largeCard.classList.remove('active')
  })

  // Add the course div and the large card to the courses container
  coursesContainer.appendChild(courseDiv)
  document.body.appendChild(largeCard)
})

auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in.
    const userId = user.uid

    get(ref(db, 'users/' + userId))
      .then(snapshot => {
        const userData = snapshot.val()
        if (userData) {
          const userRole = userData.role
          if (userRole === 'admin') {
            document.getElementById('create-course-btn').style.display = 'block'
          }
        }
      })
      .catch(error => {
        console.error('Failed to fetch user data:', error)
      })
  }
})

document
  .getElementById('create-course-btn')
  .addEventListener('click', function () {
    courseModal.show()
  })

document.getElementById('save-course-btn').addEventListener('click', function () {
  const courseTitle = document.getElementById('courseTitle').value.trim()
  const courseDescription = document.getElementById('courseDescription').value

  // Check if the course title or description is empty
  if (!courseTitle.trim() || !courseDescription.trim()) {
    alert('Please fill in all the required fields.')
    return
  }

  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in.
      const userId = user.uid

      get(ref(db, 'users/' + userId))
        .then(snapshot => {
          const userData = snapshot.val()
          if (userData) {
            const userRole = userData.role
            if (userRole != 'admin') {
              alert('Only admins can create courses.')
              return
            } else {
              get(ref(db, 'courseTitles/' + courseTitle.toLowerCase())).then(snapshot => {
                if (snapshot.exists()) {
                  alert(
                    'There is a course with this title. Please choose a different one.'
                  )
                } else {
                  const courseImageFileElement =
                    document.getElementById('courseImage')
                  let courseImageFile = courseImageFileElement.files[0]

                  if (!courseImageFile) {
                    handleCourseCreation(
                      '/img/courses/default.png',
                      courseTitle,
                      courseDescription
                    )
                    return
                  }

                  const coursesFolder = storageRef(
                    storage,
                    `courses/${courseTitle}/${courseImageFile.name}`
                  )
                  uploadBytes(coursesFolder, courseImageFile)
                    .then(snapshot => {
                      console.log('Uploaded image successfully!')
                      getDownloadURL(snapshot.ref).then(downloadURL => {
                        handleCourseCreation(
                          downloadURL,
                          courseTitle,
                          courseDescription
                        )
                      })
                    })
                    .catch(error => {
                      console.error('Failed to upload image:', error)
                    })
                }
              })
            }
          }
        })
        .catch(error => {
          console.error('Failed to fetch user data:', error)
        })
    }
  })
})

// function handleCourseCreation (downloadURL, courseTitle, courseDescription) {
//   // Create a new course object
//   const newCourse = {
//     title: courseTitle,
//     description: courseDescription,
//     image: downloadURL,
//     chapters: [], // Initialize an empty array for chapters
//     created: new Date().toISOString() // Store the current date and time
//   }
//   // Save the course to Firebase
//   const newCourseRef = push(coursesRef)
//   set(newCourseRef, newCourse)
//     .then(() => {
//       // Save the course title to Firebase with the course ID as its value
//       const newCourseTitleRef = ref(db, 'courseTitles/' + courseTitle.toLowerCase())
//       set(newCourseTitleRef, newCourseRef.key)
//         .then(() => {
//           console.log('Course saved successfully!')
//           // Reset the form fields
//           document.getElementById('courseTitle').value = ''
//           document.getElementById('courseDescription').value = ''
//           document.getElementById('courseImage').value = ''
//         })
//         .catch(error => {
//           console.error('Failed to save course title:', error)
//         })
//     })
//     .catch(error => {
//       console.error('Failed to save course:', error)
//     })

//   // Close the modal
//   courseModal.hide()
// }


function handleCourseCreation (downloadURL, courseTitle, courseDescription) {
    // Create a new course object
    const newCourse = {
      title: courseTitle,
      description: courseDescription,
      image: downloadURL,
      chapters: [], 
      created: new Date().toISOString() 
    }
    // Save the course to Firebase
    const newCourseRef = push(coursesRef)
    set(newCourseRef, newCourse)
      .then(() => {
        // Save the course title to Firebase with the course ID as its value
        const newCourseTitleRef = ref(db, 'courseTitles/' + courseTitle.toLowerCase())
        set(newCourseTitleRef, newCourseRef.key)
          .then(() => {
            console.log('Course saved successfully!')
            // Reset the form fields
            document.getElementById('courseTitle').value = ''
            document.getElementById('courseDescription').value = ''
            document.getElementById('courseImage').value = ''
  
            // // Create a template HTML for the course
            // const courseHtml = `
            // <!DOCTYPE html>
            // <html lang="en">
            //   <head>
            //     <meta charset="UTF-8" />
            //     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            //     <title>C</title>
            //     <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
            //     <link rel="stylesheet" href="/css/navbar.css" />
            //     <link rel="stylesheet" href="style.css" />
            //     <link rel="stylesheet" href="/css/footer.css" />
            //   </head>
            //   <body>
            //     <header class="navbar navbar-expand-lg navbar-light bg-light">
            //       <a class="navbar-brand" href="index.html">
            //         <img src="/img/logo.svg" alt="Logo" class="logo"/>
            //       </a>
            //       <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            //         <span class="navbar-toggler-icon"></span>
            //       </button>
            //       <div class="collapse navbar-collapse" id="navbarNav">
            //         <div class="order-1 order-lg-2 mb-3 mb-lg-0">
            //           <div id="user-info">
            //             <a href="/auth.html?form=login" id="log-in">Log in</a>
            //             <button id="sign-up-btn" class="btn" onclick="window.location.href ='/auth.html?form=signup'">Sign up</button>
            //           </div>
            //         </div>
            //         <div class="order-2 order-lg-1">
            //           <ul class="navbar-nav">
            //             <li class="nav-item">
            //               <a class="nav-link underline-effect" href="/courses.html">Courses</a>
            //             </li>
            //           <li class="nav-item">
            //             <a class="nav-link underline-effect" href="#">Assignments</a>
            //           </li>
            //           <li class="nav-item">
            //             <a class="nav-link underline-effect" href="#">Quizzes</a>
            //           </li>
            //           <li class="nav-item">
            //             <a class="nav-link underline-effect" href="/discussion.html">Discussion board</a>
            //           </li>
            //           <li class="nav-item">
            //             <a class="nav-link underline-effect" href="#">Leaderboard</a>
            //           </li>
            //           <li class="nav-item">
            //             <a class="nav-link underline-effect" href="#">Articles</a>
            //           </li>
            //           <li class="nav-item">
            //             <a class="nav-link underline-effect" href="#">Progress</a>
            //           </li>
            //         </ul>
            //       </div>
            //     </header>
               
            //     <main class="container my-5 course-content">
            //       <div class="row">
            //         <div class="col-12">
            //           <img id="course-image" class="img-fluid course-image" src="" alt="Course Image" />
            //           <h1 id="course-title" class="my-3"></h1>
            //           <p id="course-description"></p>
            //         </div>
            // <button id="create-chapter-btn" class="btn btn-primary" style="display: none;">Create Chapter</button>
            
            //       </div>
            //     </main>
            
            // <div class="modal fade" id="chapterModal" tabindex="-1" aria-labelledby="chapterModalLabel" aria-hidden="true">
            //   <div class="modal-dialog">
            //     <div class="modal-content">
            //       <div class="modal-header">
            //         <h5 class="modal-title" id="chapterModalLabel">Create Chapter</h5>
            //         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            //       </div>
            //       <div class="modal-body">
            //         <form id="chapterForm">
            //           <div class="mb-3">
            //             <label for="chapterTitle" class="form-label">Chapter Title</label>
            //             <input type="text" class="form-control" id="chapterTitle" required>
            //           </div>
            //         </form>
            //       </div>
            //       <div class="modal-footer">
            //         <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            //         <button type="button" class="btn btn-primary" id="save-chapter-btn">Save Chapter</button>
            //       </div>
            //     </div>
            //   </div>
            // </div>
            
            // <div class="modal fade" id="lessonModal" tabindex="-1" aria-labelledby="lessonModalLabel" aria-hidden="true">
            //   <div class="modal-dialog">
            //     <div class="modal-content">
            //       <div class="modal-header">
            //         <h5 class="modal-title" id="lessonModalLabel">Create Lesson</h5>
            //         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            //       </div>
            //       <div class="modal-body">
            //         <form id="lessonForm">
            //           <div class="mb-3">
            //             <label for="lessonTitle" class="form-label">Lesson Title</label>
            //             <input type="text" class="form-control" id="lessonTitle" required>
            //           </div>
            //           <div class="mb-3">
            //             <label for="lessonContent" class="form-label">Lesson Content</label>
            //             <input type="text" class="form-control" id="lessonContent" required>
            //           </div>
            //           <div class="mb-3">
            //             <label for="lessonAssignment" class="form-label">Lesson Assignment</label>
            //             <input type="text" class="form-control" id="lessonAssignment" required>
            //           </div>
            //         </form>
            //       </div>
            //       <div class="modal-footer">
            //         <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            //         <button type="button" class="btn btn-primary" id="save-lesson-btn">Save Lesson</button>
            //       </div>
            //     </div>
            //   </div>
            // </div>
            
            
            
            //     <footer class="container-fluid bg-light text-center text-lg-start">
            //       <div class="row">
            //         <div class="col-12 col-lg-4 py-3 text-lg-start text-center order-2 order-lg-1">
            //           <a href="#about">About Us</a> |
            //           <a href="#">Privacy Policy</a> |
            //           <a href="#">Terms of Use</a>
            //         </div>
            //         <div class="col-12 col-lg-4 py-3 text-center order-1 order-lg-2">
            //           <a href="#"><img src="/img/linkedin.svg" width="30" height="30" /></a>
            //           <a href="#"><img src="/img/twitterx.svg" width="30" height="30" /></a>
            //           <a href="#"><img src="/img/instagram.svg" width="30" height="30" /></a>
            //         </div>
            //         <div class="col-12 col-lg-4 py-3 text-lg-end text-center order-3">
            //           <span id="copyright">EduNest © 2024</span>
            //         </div>
            //       </div>
            //     </footer>    
            
            //     <script type="module" src="/js/navbar.js"></script>
            //     <script type="module" src="../builder.js"></script>
            //     <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
            //   </body>
            // </html>
            // `;
  
            // // Create a Blob from the HTML string
            // const courseHtmlBlob = new Blob([courseHtml], {type : 'text/html'});
  
            // // Create a reference to the HTML file in Firebase Storage
            // const courseHtmlRef = storageRef(storage, `courses/${courseTitle}/index.html`);
  
            // // Upload the HTML file to Firebase Storage
            // uploadBytes(courseHtmlRef, courseHtmlBlob).then((snapshot) => {
            //   console.log('Uploaded a blob or file!');
            // });
          })
          .catch(error => {
            console.error('Failed to save course title:', error)
          })
      })
      .catch(error => {
        console.error('Failed to save course:', error)
      })
  
    // Close the modal
    courseModal.hide()
  }