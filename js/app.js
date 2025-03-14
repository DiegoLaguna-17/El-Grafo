import Grafo from './Algorithms/Grafo.js';
import CPM from './Algorithms/CPM.js';
import GraphEvents from './Events/graphEvents.js';

const grafo = new Grafo();
const graphEvents = new GraphEvents(grafo);

grafo.graphEvents = graphEvents;

const algorithmInstances = {
    grafo: grafo,
    cpm: new CPM(),
    // Aquí van las demás instancias (algoritmos)
};

const currentAlgorithmElement = document.getElementById('currentAlgorithm');

function updateCurrentAlgorithmText() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    let algorithmName;

    switch (selectedAlgorithm) {
        case 'cpm':
            algorithmName = 'Johnson';
            break;
        case 'asignacion':
            algorithmName = 'Asignación';
            break;
        case 'noroeste':
            algorithmName = 'Noroeste';
            break;
        default:
            algorithmName = 'Johnson'; 
    }

    currentAlgorithmElement.textContent = `Actual: ${algorithmName}`;
}

document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
    radio.addEventListener('change', updateCurrentAlgorithmText);
});

// Panel de control
document.getElementById("vaciarBtn").addEventListener("click", () => grafo.vaciarCanvas());
document.getElementById("guardarGrafo").addEventListener("click", () => grafo.guardarGrafo());
document.getElementById("importarDato").addEventListener("click", () => document.getElementById("archivo").click());
document.getElementById("archivo").addEventListener("change", (e) => grafo.importarGrafo(e));

// Botón "Resolver"
document.getElementById("solve-btn").addEventListener("click", () => {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;

    let algorithmInstance;
    switch (selectedAlgorithm) {
        case 'cpm':
            algorithmInstance = algorithmInstances.cpm;
            break;
        default:
            algorithmInstance = algorithmInstances.grafo;
            break;
    }

    algorithmInstance.nodos = [...grafo.nodos];
    algorithmInstance.arcos = [...grafo.arcos];
    algorithmInstance.graphEvents = graphEvents;

    if (selectedAlgorithm === 'cpm') {
        const result = algorithmInstance.criticalPathMethod();
        if (result !== null) {
            algorithmInstance.graphEvents.displayCPMResult(result);
        }
    } else {
        alert(`Algoritmo "${selectedAlgorithm}" aún no implementado.`);
    }
});