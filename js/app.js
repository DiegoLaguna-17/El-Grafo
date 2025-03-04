import Grafo from './Algorithms/Grafo.js';
import GraphEvents from './Events/graphEvents.js';

const grafo = new Grafo();
const graphEvents = new GraphEvents(grafo);

grafo.graphEvents = graphEvents;

// Add event listeners for control buttons
document.getElementById("vaciarBtn").addEventListener("click", () => grafo.vaciarCanvas());
document.getElementById("guardarGrafo").addEventListener("click", () => grafo.guardarGrafo());
document.getElementById("importarDato").addEventListener("click", () => document.getElementById("archivo").click());
document.getElementById("archivo").addEventListener("change", (e) => grafo.importarGrafo(e));