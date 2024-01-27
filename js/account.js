window.onload = function() {
    // Fetch the quote
    fetch('https://api.api-ninjas.com/v1/quotes?category=success ',  {
      headers: {
        'X-Api-Key': 'HryCEQiWRyu6/1GwJK97tg==6kLOejxBWkQVeHdv'
      }
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('quote').innerText = data[0].quote;
    })
    .catch(error => console.error(error));
  
  }
