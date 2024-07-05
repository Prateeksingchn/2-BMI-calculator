document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#bmi-form');
    const clearButton = document.querySelector('#clear');
    const results = document.querySelector('#results');
    const heightHelp = document.querySelector('#heightHelp');
    const weightHelp = document.querySelector('#weightHelp');
    const dateInput = document.querySelector('#date');
    const trendElement = document.querySelector('#trend');
    const bmiHistoryTableBody = document.querySelector('#bmiHistoryTableBody');

    let bmiData = JSON.parse(localStorage.getItem('bmiData')) || [];
    let chart;

    flatpickr(dateInput, {
        dateFormat: 'Y-m-d',
        defaultDate: 'today'
    });

    function initChart() {
        const ctx = document.getElementById('bmiChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'BMI',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    function updateChart() {
        const sortedData = bmiData.sort((a, b) => new Date(a.date) - new Date(b.date));
        chart.data.labels = sortedData.map(data => data.date);
        chart.data.datasets[0].data = sortedData.map(data => parseFloat(data.bmi));
        chart.update();
    }

    function updateBMIHistoryTable() {
        bmiHistoryTableBody.innerHTML = '';
        const sortedData = bmiData.sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedData.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4">${entry.date}</td>
                <td class="py-2 px-4">${entry.bmi}</td>
                <td class="py-2 px-4 ${getBMICategoryColor(entry.category)}">${entry.category}</td>
            `;
            bmiHistoryTableBody.appendChild(row);
        });
    }

    function getBMICategoryColor(category) {
        switch (category) {
            case 'Underweight': return 'text-blue-500';
            case 'Normal': return 'text-green-500';
            case 'Overweight': return 'text-yellow-500';
            case 'Obese': return 'text-red-500';
            default: return '';
        }
    }

    function updateTrend() {
        if (bmiData.length < 2) {
            trendElement.textContent = 'Not enough data for trend';
            return;
        }
        const sortedData = bmiData.sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastTwo = sortedData.slice(0, 2);
        const diff = parseFloat(lastTwo[0].bmi) - parseFloat(lastTwo[1].bmi);
        let trendText = '';
        let trendColor = '';
        if (diff > 0) {
            trendText = 'Trending Up';
            trendColor = 'text-red-500';
        } else if (diff < 0) {
            trendText = 'Trending Down';
            trendColor = 'text-green-500';
        } else {
            trendText = 'Stable';
            trendColor = 'text-gray-500';
        }
        trendElement.textContent = `Trend: ${trendText}`;
        trendElement.className = `mt-4 text-center font-bold ${trendColor}`;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const height = parseFloat(document.querySelector('#height').value);
        const weight = parseFloat(document.querySelector('#weight').value);
        const date = dateInput.value;

        heightHelp.textContent = '';
        weightHelp.textContent = '';

        if (!date) {
            alert('Please select a date.');
            return;
        }

        if (!height || height <= 0 || isNaN(height)) {
            heightHelp.textContent = 'Please enter a valid height.';
            return;
        }

        if (!weight || weight <= 0 || isNaN(weight)) {
            weightHelp.textContent = 'Please enter a valid weight.';
            return;
        }

        const bmi = (weight / ((height / 100) * (height / 100))).toFixed(2);

        let category = '';
        results.className = 'mt-4 p-4 rounded-md';

        if (bmi < 18.5) {
            category = 'Underweight';
            results.classList.add('bg-blue-100', 'text-blue-700');
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal';
            results.classList.add('bg-green-100', 'text-green-700');
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            results.classList.add('bg-yellow-100', 'text-yellow-700');
        } else {
            category = 'Obese';
            results.classList.add('bg-red-100', 'text-red-700');
        }

        results.innerHTML = `<p class="font-bold">BMI: ${bmi}</p><p>Category: ${category}</p>`;
        results.style.display = 'block';

        const entryIndex = bmiData.findIndex(data => data.date === date);

        if (entryIndex >= 0) {
            bmiData[entryIndex] = { date, height, weight, bmi, category };
        } else {
            bmiData.push({ date, height, weight, bmi, category });
        }

        localStorage.setItem('bmiData', JSON.stringify(bmiData));
        updateChart();
        updateBMIHistoryTable();
        updateTrend();
    });

  
    clearButton.addEventListener('click', () => {
        form.reset();
        results.style.display = 'none';
        results.className = 'mt-4 p-4 rounded-md hidden';
        heightHelp.textContent = '';
        weightHelp.textContent = '';
        trendElement.textContent = '';
    });

    initChart();
    updateChart();
    updateBMIHistoryTable();
    updateTrend();
});