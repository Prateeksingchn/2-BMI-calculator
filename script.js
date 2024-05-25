document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#bmi-form');
    const clearButton = document.querySelector('#clear');
    const results = document.querySelector('#results');
    const heightHelp = document.querySelector('#heightHelp');
    const weightHelp = document.querySelector('#weightHelp');
    const calendarElement = document.querySelector('#calendar');
    const dateInput = document.querySelector('#date');
    const chartCanvas = document.getElementById('myChart');

    let bmiData = JSON.parse(localStorage.getItem('bmiData')) || [];
    let chart;

    const calendar = flatpickr(calendarElement, {
        inline: true,
        enableTime: false,
        dateFormat: 'Y-m-d',
        onChange: function(selectedDates, dateStr, instance) {
            displayBMIForDate(dateStr);
        }
    });

    flatpickr(dateInput, {
        dateFormat: 'Y-m-d'
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const height = parseInt(document.querySelector('#height').value);
        const weight = parseInt(document.querySelector('#weight').value);
        const date = dateInput.value;

        heightHelp.textContent = '';
        weightHelp.textContent = '';

        if (!date) {
            alert('Please select a date.');
            return;
        }

        if (!height || height <= 0 || isNaN(height)) {
            heightHelp.textContent = 'Please enter a valid height.';
        } else if (!weight || weight <= 0 || isNaN(weight)) {
            weightHelp.textContent = 'Please enter a valid weight.';
        } else {
            const bmi = (weight / ((height * height) / 10000)).toFixed(2);

            let bmiCategory = '';
            results.className = 'mt-4 p-4 rounded-md';

            if (bmi < 18.6) {
                bmiCategory = 'Underweight';
                results.classList.add('bg-orange-200', 'text-orange-700');
            } else if (bmi >= 18.6 && bmi <= 24.9) {
                bmiCategory = 'Normal';
                results.classList.add('bg-green-200', 'text-green-700');
            } else {
                bmiCategory = 'Overweight';
                results.classList.add('bg-yellow-200', 'text-yellow-700');
            }

            results.innerHTML = `<span>${bmi}</span> - ${bmiCategory}`;
            results.style.display = 'block';

            const entryIndex = bmiData.findIndex(data => data.date === date);

            if (entryIndex >= 0) {
                bmiData[entryIndex] = { date, height, weight, bmi, bmiCategory };
            } else {
                bmiData.push({ date, height, weight, bmi, bmiCategory });
            }

            localStorage.setItem('bmiData', JSON.stringify(bmiData));
            calendar.redraw();

            // Update chart data
            updateChart();
        }
    });

    clearButton.addEventListener('click', () => {
        form.reset();
        results.style.display = 'none';
        results.className = 'mt-4 p-4 rounded-md';
        heightHelp.textContent = '';
        weightHelp.textContent = '';
    });

    function displayBMIForDate(date) {
        const entry = bmiData.find(data => data.date === date);
        if (entry) {
            results.innerHTML = `<span>${entry.bmi}</span> - ${entry.bmiCategory}`;
            results.style.display = 'block';
        } else {
            results.innerHTML = 'No data for this date.';
            results.style.display = 'block';
        }
    }

    // Initialize the chart
    function initChart() {
        chart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: bmiData.map(data => data.date),
                datasets: [{
                    label: 'BMI',
                    data: bmiData.map(data => parseFloat(data.bmi)),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    // Update the chart with new data
    function updateChart() {
        chart.data.labels = bmiData.map(data => data.date);
        chart.data.datasets[0].data = bmiData.map(data => parseFloat(data.bmi));
        chart.update();
    }

    // Initialize the chart
    initChart();
});
