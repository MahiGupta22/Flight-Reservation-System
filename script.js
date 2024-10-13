class Graph {
    constructor() {
        this.graph = JSON.parse(localStorage.getItem('flights')) || {};
    }

    addFlight(from, to, cost) {
        from = from.toLowerCase();
        to = to.toLowerCase();
        if (!this.graph[from]) {
            this.graph[from] = [];
        }
        this.graph[from].push({ to, cost: parseInt(cost) });
        this.saveFlights();
    }

    saveFlights() {
        localStorage.setItem('flights', JSON.stringify(this.graph));
    }

    getFlights() {
        return this.graph;
    }

    dijkstra(start, end) {
        start = start.toLowerCase();
        end = end.toLowerCase();

        if (!(start in this.graph) || !(end in this.graph)) {
            return { path: [], cost: Infinity };
        }

        let distances = {};
        let prev = {};
        let pq = new PriorityQueue();

        Object.keys(this.graph).forEach(node => {
            distances[node] = Infinity;
            prev[node] = null;
        });
        distances[start] = 0;
        pq.enqueue(start, 0);

        while (!pq.isEmpty()) {
            let { element: current } = pq.dequeue();

            if (current === end) break;

            for (let neighbor of this.graph[current] || []) {
                let alt = distances[current] + neighbor.cost;
                if (alt < distances[neighbor.to]) {
                    distances[neighbor.to] = alt;
                    prev[neighbor.to] = current;
                    pq.enqueue(neighbor.to, alt);
                }
            }
        }

        let path = [];
        for (let at = end; at; at = prev[at]) {
            path.push(at);
        }
        path.reverse();

        return { path, cost: distances[end] };
    }
}

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift();
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

const graph = new Graph();

function showAdminMenu() {
    document.getElementById('adminMenu').classList.remove('hidden');
    document.getElementById('userMenu').classList.add('hidden');
}

function showUserMenu() {
    document.getElementById('userMenu').classList.remove('hidden');
    document.getElementById('adminMenu').classList.add('hidden');
}

function backToMain() {
    document.getElementById('adminMenu').classList.add('hidden');
    document.getElementById('userMenu').classList.add('hidden');
}

function addFlight() {
    const from = document.getElementById('fromAirport').value;
    const to = document.getElementById('toAirport').value;
    const cost = document.getElementById('flightCost').value;

    graph.addFlight(from, to, cost);
    alert('Flight added successfully!');
}

function viewFlights() {
    const flightsList = document.getElementById('flightsList');
    const flights = graph.getFlights();
    flightsList.innerHTML = '';

    if (Object.keys(flights).length === 0) {
        flightsList.innerHTML = 'No flights available.';
    } else {
        for (let from in flights) {
            for (let flight of flights[from]) {
                flightsList.innerHTML += `Flight from ${from} to ${flight.to} costs ${flight.cost}<br>`;
            }
        }
    }
}

function searchFlight() {
    const start = document.getElementById('searchFrom').value;
    const end = document.getElementById('searchTo').value;

    const { path, cost } = graph.dijkstra(start, end);

    const resultDiv = document.getElementById('searchResult');
    if (cost === Infinity) {
        resultDiv.innerHTML = 'No available route found.';
    } else {
        resultDiv.innerHTML = `Shortest path: ${path.join(' -> ')}, Total cost: ${cost}`;
    }
}
