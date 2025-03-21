import "https://cdn.jsdelivr.net/npm/chart.js";

const intervals = [];

function formatDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export default {
    mount: (container, props, settings) => {
        container.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-flow: row wrap;
                    font-family: Arial, Helvetica, sans-serif;
                }
                .container {
                    margin: 1rem;
                }
                .plot {
                    width: 600px;
                    height: 250px;
                    margin: 1rem;
                }
                h1 {
                    margin: 1rem;
                    font-size: 1.5rem;
                }
            </style>
            <div class="container">
                <canvas id="cpu-load-plot" class="plot"></canvas>
            </div>
            <div class="container">
                <canvas id="cpu-temp-plot" class="plot"></canvas>
            </div>
        `;

        const loadPlot = container.getElementById("cpu-load-plot");
        const tempPlot = container.getElementById("cpu-temp-plot");

        const loadChart = new Chart(
            loadPlot, {
                type: "line",
                data: {
                    labels: [],
                    datasets: [{
                        label: "CPU load (%)",
                        data: [],
                    }]
                },
                options: {
                    animation: false,
                }
            }
        );

        const tempChart = new Chart(
            tempPlot, {
                type: "line",
                data: {
                    labels: [],
                    datasets: [{
                        label: "CPU temperature (°C)",
                        data: [],
                    }]
                },
                options: {
                    animation: false,
                }
            }
        );

        const downloadData = (interfaceName, endpoint) => {
            const url = `${props.astarteUrl}/appengine/v1/${props.realm}/devices/${props.deviceId}/interfaces/${interfaceName}/${endpoint}?limit=10`;
            return fetch(url, {
                headers: {
                    "Authorization": `Bearer ${props.token}`,
                    "Content-Type": "application/json;charset=UTF-8"
                }
            }).then(res => res.json()).then(json => json.data.reverse());
        };

        const setValues = (chart, values) => {
            chart.data.labels = values.map(v => formatDate(new Date(v.timestamp)));
            chart.data.datasets[0].data = values.map(v => v.value);
            chart.update();
        };

        const updateLoad = () => {
            downloadData("com.example.poc.CpuMetrics", "loadavg")
                .then(values => setValues(loadChart, values));
        };

        const updateTemp = () => {
            downloadData("com.example.poc.CpuTemp", "temp")
                .then(values => setValues(tempChart, values));
        };

        updateLoad();
        updateTemp();

        intervals.push(setInterval(() => { updateLoad(); }, 5000));
        intervals.push(setInterval(() => { updateTemp(); }, 5000));
    },
    unmount: (container) => {
        for (let interval of intervals) {
            clearInterval(interval);
        }
    },
};
