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
        </div>
        <span class="exit-button">X</span>
    `

  // Show the large card when the course card is clicked
  courseDiv.addEventListener('click', () => {
    largeCard.classList.add('active')
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

document.getElementById('saveCourse').addEventListener('click', function () {
  const courseTitle = document.getElementById('courseTitle').value
  const courseDescription = document.getElementById('courseDescription').value
  // Check if the course title or description is empty
  if (!courseTitle.trim() || !courseDescription.trim()) {
    alert('Please fill in all the required fields.')
    return
  }

  // Check if the user is an admin
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
              const courseImageFileElement =
                document.getElementById('courseImage')
              let courseImageFile = courseImageFileElement.files[0]

              // If no image is selected by the admin, use the default image URL
              if (!courseImageFile) {
                handleCourseCreation(
                  './img/courses/default.png',
                  courseTitle,
                  courseDescription
                )
                return
              }

              const coursesFolder = storageRef(
                storage,
                `courses/${courseImageFile.name}`
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
          }
        })
        .catch(error => {
          console.error('Failed to fetch user data:', error)
        })
    }
  })
})

function handleCourseCreation (downloadURL, courseTitle, courseDescription) {
  // Create a new course object
  const newCourse = {
    title: courseTitle,
    description: courseDescription,
    image: downloadURL,
    chapters: [], // Initialize an empty array for chapters
    created: new Date().toISOString() // Store the current date and time
  }
  // Save the course to Firebase
  const newCourseRef = push(coursesRef)
  set(newCourseRef, newCourse)
    .then(() => {
      console.log('Course saved successfully!')
      // Reset the form fields
      document.getElementById('courseTitle').value = ''
      document.getElementById('courseDescription').value = ''
      document.getElementById('courseImage').value = ''
    })
    .catch(error => {
      console.error('Failed to save course:', error)
    })

  // Close the modal
  courseModal.hide()
}
