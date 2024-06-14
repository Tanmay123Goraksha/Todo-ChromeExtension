document.addEventListener('DOMContentLoaded', function() {
    const greetingElement = document.getElementById('greeting');
    const weatherIconElement = document.getElementById('weather-icon');
    const weatherDescriptionElement = document.getElementById('weather-description');
    const temperatureElement = document.getElementById('temperature');
    const text = document.querySelector(".text");
    const input = document.getElementById("input");

    const currentHour = new Date().getHours();
    let greeting;

    // Determine the appropriate greeting based on the current time
    if (currentHour >= 5 && currentHour < 12) {
        greeting = "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
        greeting = "Good afternoon";
    } else if (currentHour >= 18 && currentHour < 21) {
        greeting = "Good evening";
    } else {
        greeting = "Good night";
    }

    greetingElement.textContent = greeting;

    // Set Mumbai coordinates
    const lat = 19.0760;
    const lon = 72.8777;
    const apiKey = '1ca7d650d2113d1b4b3d851c55183952'; // Replace with your OpenWeatherMap API key
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    // Fetch weather information for Mumbai
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            const weatherDescription = data.weather[0].description;
            const temperature = data.main.temp;
            const iconCode = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

            weatherIconElement.innerHTML = `<img src="${iconUrl}" alt="Weather icon">`;
            weatherDescriptionElement.textContent = weatherDescription;
            temperatureElement.textContent = `${temperature}°C`;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });

    // Function to add a task
    async function addTask(task) {
        try {
            const newTask = document.createElement("li");
            newTask.innerHTML = `${task} <button class="delete-btn">Delete</button>`;
            text.appendChild(newTask);

            // Add event listener to the delete button
            newTask.querySelector(".delete-btn").addEventListener("click", async function() {
                newTask.remove();
                await deleteTask(task);
            });

            // Save tasks to storage after adding
            await saveTask(task);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    // Function to save a task to storage
    async function saveTask(task) {
        try {
            const result = await new Promise((resolve, reject) => {
                chrome.storage.sync.get(['tasks'], function(result) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    const tasks = result.tasks || [];
                    tasks.push(task);
                    chrome.storage.sync.set({ tasks: tasks }, function() {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }
                        resolve(tasks);
                    });
                });
            });
            console.log('Task saved:', task);
        } catch (error) {
            console.error('Error saving task:', error);
        }
    }

    // Function to load tasks from storage
    async function loadTasks() {
        try {
            const result = await new Promise((resolve, reject) => {
                chrome.storage.sync.get(['tasks'], function(result) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    resolve(result.tasks || []);
                });
            });
            result.forEach(task => addTask(task));
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    // Function to delete a task from storage
    async function deleteTask(task) {
        try {
            const result = await new Promise((resolve, reject) => {
                chrome.storage.sync.get(['tasks'], function(result) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    const tasks = result.tasks || [];
                    const updatedTasks = tasks.filter(t => t !== task);
                    chrome.storage.sync.set({ tasks: updatedTasks }, function() {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }
                        resolve(updatedTasks);
                    });
                });
            });
            console.log('Task deleted:', task);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    // Event listener for the "Add" button click
    document.querySelector(".btn-primary").addEventListener("click", function() {
        const task = input.value.trim();
        if (task === '') {
            alert("Field cannot be empty");
            return;
        }

        addTask(task);
        input.value = "";
    });

    // Event listener for pressing Enter in the input field
    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            const task = input.value.trim();
            if (task === '') {
                alert("Field cannot be empty");
                return;
            }

            addTask(task);
            input.value = "";
        }
    });

    // Load tasks when the extension is initialized
    loadTasks();
});
