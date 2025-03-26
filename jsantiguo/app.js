import Grafo from './Algorithms/Grafo.js';
import CPM from './Algorithms/CPM.js';
import ASG from './Algorithms/ASG.js';
import GraphEvents from './Events/graphEvents.js';

const grafo = new Grafo();
const graphEvents = new GraphEvents(grafo);

grafo.graphEvents = graphEvents;

const algorithmInstances = {
    grafo: grafo,
    cpm: new CPM(),
    asg: new ASG(),
    // Aquí van las demás instancias (algoritmos)
};

const currentAlgorithmElement = document.getElementById('currentAlgorithm');

function updateCurrentAlgorithmText() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    let algorithmName;

    switch (selectedAlgorithm) {
        case 'grafo':
            algorithmName = 'Grafo';
            document.getElementById("checkboxGroup1").style.display = "none";
            break;
        case 'cpm':
            algorithmName = 'Johnson';
            document.getElementById("checkboxGroup1").style.display = "none";
            break;
        case 'Asignacion':
            algorithmName = 'Asignacion';
            document.getElementById("checkboxGroup1").style.display = "block";
            break;
        case 'noroeste':
            algorithmName = 'Noroeste';
            document.getElementById("checkboxGroup1").style.display = "none";
            break;
        default:
            algorithmName = 'Grafo'; // Default to Grafo
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

    if (selectedAlgorithm === 'grafo') {
        // Do nothing for Grafo
        return;
    }

    let algorithmInstance;
    switch (selectedAlgorithm) {
        case 'cpm':
            algorithmInstance = algorithmInstances.cpm;
            break;
        case 'Asignacion':
            algorithmInstance = algorithmInstances.asg;
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
    }

    if (selectedAlgorithm === 'Asignacion') {
        let eleccion = document.querySelector('input[name="check"]:checked').value;
        let maxMin = eleccion === "true";
        let asignador = algorithmInstance.crearMatrizCostos();
        let matriz = []; // Asegurar que la matriz de salida esté inicializada
        for (let i = 0; i < asignador.length; i++) {
            let fila = [];
            for (let j = 0; j < asignador[i].length; j++) {
                if (asignador[i][j] && asignador[i][j].valor !== 0) {
                    fila.push(asignador[i][j]);
                }
            }
            if (fila.length !== 0) {
                matriz.push(fila);
            }
        }

        let matrizCompleta = Array.from({ length: matriz.length + 1 }, () => Array(matriz.length + 1).fill(0));
        matrizCompleta[0][0] = " ";
        for (let i = 0; i < matriz.length; i++) {
            grafo.nodos.forEach((n) => {
                if (n.id == matriz[0][i].hacia) {
                    matrizCompleta[0][i + 1] = n.nombre;
                }
            });
        }
        for (let i = 0; i < matriz.length; i++) {
            grafo.nodos.forEach((n) => {
                if (n.id == matriz[i][0].de) {
                    matrizCompleta[i + 1][0] = n.nombre;
                }
            });
        }
        if (maxMin === true) {
            for (let i = 0; i < matriz.length; i++) {
                for (let j = 0; j < matriz.length; j++) {
                    matrizCompleta[i + 1][j + 1] = matriz[i][j].valor;
                }
            }
        } else {
            for (let i = 0; i < matriz.length; i++) {
                for (let j = 0; j < matriz.length; j++) {
                    matrizCompleta[i + 1][j + 1] = matriz[i][j].valor * -1;
                }
            }
        }
        const matrizC = matrizCompleta;
        const resultado = algorithmInstance.hungarianAlgorithm(matrizC, maxMin);
        algorithmInstance.graphEvents.resultadoAsignacion(resultado.pairs);
        algorithmInstance.graphEvents.displayASGResult(resultado);
    }
});