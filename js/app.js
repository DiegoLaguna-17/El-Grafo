import Grafo from './Algorithms/Grafo.js';
import Johnson from './Algorithms/Johnson.js'; 
import GraphEvents from './Events/graphEvents.js';

const grafo = new Grafo();
const graphEvents = new GraphEvents(grafo);

grafo.graphEvents = graphEvents;

// Instancias de algoritmos
const algorithmInstances = {
    grafo: grafo, 
    johnson: new Johnson(), 
    // Aquí van las demás instancias (algoritmos)
};

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
        case 'johnson':
            algorithmInstance = algorithmInstances.johnson;
            break;
        default:
            algorithmInstance = algorithmInstances.grafo; 
            break;
    }

    algorithmInstance.nodos = [...grafo.nodos];
    algorithmInstance.arcos = [...grafo.arcos];
    algorithmInstance.graphEvents = graphEvents; 

    if (selectedAlgorithm === 'johnson') {
        const shortestPaths = algorithmInstance.johnsonsAlgorithm();
        algorithmInstance.graphEvents.displaySolutionMatrix(shortestPaths);
    } else {
        alert(`Algoritmo "${selectedAlgorithm}" aún no implementado.`);
    }
});