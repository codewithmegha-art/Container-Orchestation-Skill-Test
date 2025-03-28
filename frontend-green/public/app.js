document.addEventListener('DOMContentLoaded', function() {
    // Form steps navigation
    const progress = document.getElementById('progress');
    const formSteps = document.querySelectorAll('.form-step');
    const steps = document.querySelectorAll('.step');
    
    let currentStep = 1;
    
    // Next buttons (similar to blue, with minor text changes)
    document.getElementById('next1').addEventListener('click', () => {
      const name = document.getElementById('name').value;
      const surname = document.getElementById('surname').value;
      const dob = document.getElementById('dob').value;
      
      if (!name || !surname || !dob) {
        showMessage('Please complete all personal details', 'error');
        return;
      }
      
      goToStep(2);
    });
    
    document.getElementById('next2').addEventListener('click', () => {
      const job = document.getElementById('job').value;
      const place = document.getElementById('place').value;
      
      if (!job || !place) {
        showMessage('Please provide your career information', 'error');
        return;
      }
      
      goToStep(3);
    });
    
    // Previous buttons
    document.getElementById('prev2').addEventListener('click', () => {
      goToStep(1);
    });
    
    document.getElementById('prev3').addEventListener('click', () => {
      goToStep(2);
    });
    
    // Rest of the code remains the same as blue version
    function goToStep(step) {
      formSteps.forEach(formStep => {
        formStep.classList.remove('active');
      });
      
      document.getElementById(`step${step}`).classList.add('active');
      
      steps.forEach((stepEl, idx) => {
        if (idx < step) {
          stepEl.classList.add('completed');
          stepEl.classList.add('active');
        } else if (idx === step - 1) {
          stepEl.classList.remove('completed');
          stepEl.classList.add('active');
        } else {
          stepEl.classList.remove('completed');
          stepEl.classList.remove('active');
        }
      });
      
      const progressWidth = ((step - 1) / (steps.length - 1)) * 100;
      progress.style.width = `${progressWidth}%`;
      
      currentStep = step;
    }
    
    // Tag inputs and form submission similar to blue version
    const interestInput = document.getElementById('interestInput');
    const interestTags = document.getElementById('interestTags');
    const interestsHidden = document.getElementById('interests');
    
    let interests = [];
    
    interestInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const value = interestInput.value.trim();
        if (value && !interests.includes(value)) {
          addTag(value, interestTags, interests);
          updateHiddenField(interestsHidden, interests);
          interestInput.value = '';
        }
      }
    });
    
    // Remaining functions similar to blue version
    function addTag(text, container, array) {
      const tag = document.createElement('span');
      tag.classList.add('tag');
      tag.innerHTML = `${text} <i class="fas fa-times"></i>`;
      
      tag.querySelector('i').addEventListener('click', () => {
        container.removeChild(tag);
        const index = array.indexOf(text);
        if (index !== -1) {
          array.splice(index, 1);
          updateHiddenField(interestsHidden, interests);
        }
      });
      
      container.appendChild(tag);
      array.push(text);
    }
    
    function updateHiddenField(hiddenField, array) {
      hiddenField.value = JSON.stringify(array);
    }
    
    document.getElementById('registrationForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (interests.length === 0) {
        showMessage('Please add at least one hobby', 'error');
        return;
      }
      
      const formData = {
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        dob: document.getElementById('dob').value,
        job: document.getElementById('job').value,
        place: document.getElementById('place').value,
        interests: interests,
        registeredFrom: 'green'
      };
      
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const result = await response.json();
          showMessage('Registration completed successfully!', 'success');
          document.getElementById('registrationForm').reset();
          interests = [];
          updateHiddenField(interestsHidden, interests);
          goToStep(1);
        } else {
          const error = await response.json();
          showMessage(`Registration failed: ${error.message}`, 'error');
        }
      } catch (error) {
        showMessage(`Server connection error: ${error.message}`, 'error');
      }
    });
    
    function showMessage(text, type) {
      const messageContainer = document.getElementById('message');
      messageContainer.innerHTML = text;
      messageContainer.className = 'message-container';
      messageContainer.classList.add(type);
      messageContainer.style.display = 'block';
      
      setTimeout(() => {
        messageContainer.style.display = 'none';
      }, 5000);
    }
}); 