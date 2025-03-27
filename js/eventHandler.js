import Graph from './Graph.js';

const container = document.getElementById('network');
const nodeContextMenu = document.getElementById('nodeContextMenu');
const nodes = new vis.DataSet([]);
const edges = new vis.DataSet([]);

const options = {
    nodes: {
        shape: 'circle',
        color: '#00E3C6',
        physics: false,
    },
    edges: {
        color: '#000000',
        width: 2,
        font: {
            size: 14,
            face: 'arial',
            strokeWidth: 5,
            strokeColor: '#ffffff'
        },
        smooth: {
            type: 'continuous'
        },
        arrows: {
            to: { 
                enabled: true, 
                scaleFactor: 1.5 
            },
        },
    },
    interaction: {
        hover: true,
        tooltipDelay: 0
    }
};

const data = { nodes, edges };
const network = new vis.Network(container, data, options);
const graph = new Graph(nodes, edges);

//              ***** Variables Auxiliares *****
// Opciones de menú contextual
const addLoopBtn = document.getElementById('addLoopBtn');
const changeLabelBtn = document.getElementById('changeLabelBtn');
const nodeColorPicker = document.getElementById('nodeColorPicker');
const deleteNodeBtn = document.getElementById('deleteNodeBtn');

// Botones de Control
const vaciarBtn = document.getElementById('vaciarBtn');
const guardarGrafo = document.getElementById('guardarGrafo');
const importarDato = document.getElementById('importarDato');
const solve_btn = document.getElementById('solve-btn'); 

// Comodines
let isCreatingEdge = false;
let sourceNodeId = null;
let selectedNodeId = null;

// Para editar el peso
const edgeContextButton = document.getElementById('edgeContextButton');
const changeWeightBtn = document.getElementById('changeWeightBtn');
let selectedEdgeId = null;
let edgeButtonTimeout = null;


// ***** EVENTOS *****
network.on("hoverEdge", function(params) {
    selectedEdgeId = params.edge;
    const pointer = params.pointer.DOM;
    
    if (edgeButtonTimeout) {
        clearTimeout(edgeButtonTimeout);
        edgeButtonTimeout = null;
    }
    
    edgeContextButton.style.display = 'block';
    edgeContextButton.style.left = pointer.x + 'px';
    edgeContextButton.style.top = pointer.y + 'px';
});

network.on("blurEdge", function() {
    edgeButtonTimeout = setTimeout(() => {
        edgeContextButton.style.display = 'none';
        selectedEdgeId = null;
    }, 900); // Tiempo (ms) antes de desaparecer
});

edgeContextButton.addEventListener('mouseenter', function() {
    if (edgeButtonTimeout) {
        clearTimeout(edgeButtonTimeout);
        edgeButtonTimeout = null;
    }
});

edgeContextButton.addEventListener('mouseleave', function() {
    edgeButtonTimeout = setTimeout(() => {
        edgeContextButton.style.display = 'none';
        selectedEdgeId = null;
    }, 300);
});

network.on("click", function(params) {
    if (!params.edges.length && !edgeContextButton.contains(params.event.target)) {
        edgeContextButton.style.display = 'none';
        selectedEdgeId = null;
    }
});

changeWeightBtn.addEventListener('click', function() {
    if (selectedEdgeId) {
        const edge = edges.get(selectedEdgeId);
        const newWeight = prompt('Ingrese nuevo peso:', edge.label || "0");
        if (newWeight !== null) {
            edges.update({
                id: selectedEdgeId,
                label: newWeight
            });
            updateAdjacencyMatrix();
        }
        edgeContextButton.style.display = 'none';
        selectedEdgeId = null;
    }
});

// Agregar Nodo
network.on("click", function(params) {
    if (params.nodes.length === 0 && params.edges.length === 0) {
        const pointerPosition = params.pointer.canvas;
        const newNodeId = nodes.length + 1; 
        nodes.add({
            id: newNodeId,
            label: `Nodo ${newNodeId}`,
            x: pointerPosition.x,
            y: pointerPosition.y,
        });
        updateAdjacencyMatrix();
        console.log(`Nodo ${newNodeId} creado.`);
    }
});

// Crear arco
network.on('doubleClick', function(params) {
    if (params.nodes.length === 1) {
        if (!isCreatingEdge) {
            sourceNodeId = params.nodes[0];
            isCreatingEdge = true;
            console.log(`Creando un arco con origen en Nodo ${sourceNodeId}`);
        } else {
            const destinationNodeId = params.nodes[0];
            
            if (sourceNodeId !== destinationNodeId) {
                // Ver si es necesario controlar varios arcos entre nodos
                if (!allowsCycles() && edgeExists(sourceNodeId, destinationNodeId)) {
                    alert('No se permiten múltiples aristas entre nodos en este modo de algoritmo');
                } else {
                    edges.add({
                        from: sourceNodeId,
                        to: destinationNodeId,
                        label: "0", // Por defecto
                        arrows: 'to',
                    });
                    updateAdjacencyMatrix();
                    console.log(`Arco creado desde Nodo ${sourceNodeId} hacia ${destinationNodeId}`);
                }
            } else {
                // Controlar Bucles
                if (allowsCycles()) {
                    edges.add({
                        from: sourceNodeId,
                        to: destinationNodeId,
                        label: '0',
                        arrows: 'to',
                    });
                    updateAdjacencyMatrix();
                } else {
                    alert('No se permiten bucles en este modo de algoritmo');
                }
            }
            isCreatingEdge = false;
            sourceNodeId = null;
        }
    }
});

// Menú desplegable
network.on('oncontext', function(params) {
    params.event.preventDefault();

    if (params.nodes.length === 0) {
        nodeContextMenu.style.display = 'none';
        return;
    }

    selectedNodeId = params.nodes[0];
    const pointer = {
        x: params.pointer.DOM.x,
        y: params.pointer.DOM.y
    };

    nodeContextMenu.style.display = 'block';
    nodeContextMenu.style.left = pointer.x + 'px';
    nodeContextMenu.style.top = pointer.y + 'px';
});


// Agregar Bucle
addLoopBtn.addEventListener('click', function() {
    if (selectedNodeId) {
        if (allowsCycles()) {
            edges.add({
                from: selectedNodeId,
                to: selectedNodeId,
                label: '0',
                arrows: 'to'
            });
            updateAdjacencyMatrix();
        } else {
            alert('No se permiten bucles en este modo de algoritmo');
        }
        nodeContextMenu.style.display = 'none';
    }
});

// Cambiar Nombre
changeLabelBtn.addEventListener('click', function() {
    if (selectedNodeId) {
        const newLabel = prompt('Ingresar nuevo nombre:', graph.getNode(selectedNodeId).label);
        if (newLabel !== null) {
            graph.updateNode(selectedNodeId, { label: newLabel });
        }
        nodeContextMenu.style.display = 'none';
        updateAdjacencyMatrix();
    }
});

// Cambiar color
nodeColorPicker.addEventListener('input', function(e) {
    if (selectedNodeId) {
        graph.updateNode(selectedNodeId, { color: e.target.value });
    }
});

// Borrar Nodo
deleteNodeBtn.addEventListener('click', function() {
    if (selectedNodeId) {
        graph.removeNode(selectedNodeId);
        nodeContextMenu.style.display = 'none';
        updateAdjacencyMatrix();
    }
});

// ***** Botones de Control *****
vaciarBtn.addEventListener('click', function() {
    graph.clear();
    updateAdjacencyMatrix();
});

guardarGrafo.addEventListener('click', function() {
    const graphData = {
        nodes: nodes.get(),
        edges: edges.get().map(edge => {
            return {
                from: edge.from,
                to: edge.to,
                label: edge.label,
                arrows: edge.arrows
            };
        })
    };
    
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = 'graph.json';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

importarDato.addEventListener('click', function() {
    document.getElementById('archivo').click();
});

document.getElementById('archivo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const graphData = JSON.parse(e.target.result);
            
            if (!graphData.nodes || !graphData.edges) {
                throw new Error("Invalid graph file format");
            }
            
            // Verificar que el grafo importado cumpla con restricciones
            if (!allowsCycles()) {
                const edgeMap = new Map();
                for (const edge of graphData.edges) {
                    const key = [edge.from, edge.to].sort().join('-');
                    if (edge.from === edge.to) {
                        throw new Error("El grafo importado contiene bucles, pero el algoritmo actual no los permite");
                    }
                    if (edgeMap.has(key)) {
                        throw new Error("El grafo importado contiene múltiples aristas entre nodos, pero el algoritmo actual no las permite");
                    }
                    edgeMap.set(key, true);
                }
            }
            
            graph.clear();
            nodes.add(graphData.nodes);
            edges.add(graphData.edges.map(edge => ({
                ...edge,
                label: edge.label || "0" 
            })));
            updateAdjacencyMatrix();
            console.log('Grafo importado correctamente');

        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// ****** JOHNSON *****
function calculateCriticalPath() {
    const nodeIds = nodes.getIds().sort((a, b) => a - b);
    const edgesList = edges.get();
    
    const forwardPass = {};
    const backwardPass = {};
    const slack = {};
    const criticalPath = [];
    
    nodeIds.forEach(id => {
        forwardPass[id] = 0;
        backwardPass[id] = Infinity;
    });
    
    const sortedNodes = topologicalSort(nodeIds, edgesList);
    sortedNodes.forEach(nodeId => {
        edgesList
            .filter(edge => edge.from === nodeId)
            .forEach(edge => {
                const weight = parseInt(edge.label) || 0;
                forwardPass[edge.to] = Math.max(
                    forwardPass[edge.to], 
                    forwardPass[nodeId] + weight
                );
            });
    });
    
    const lastNode = sortedNodes[sortedNodes.length - 1];
    backwardPass[lastNode] = forwardPass[lastNode];
    
    [...sortedNodes].reverse().forEach(nodeId => {
        edgesList
            .filter(edge => edge.to === nodeId)
            .forEach(edge => {
                const weight = parseInt(edge.label) || 0;
                backwardPass[edge.from] = Math.min(
                    backwardPass[edge.from],
                    backwardPass[nodeId] - weight
                );
            });
    });
    
    edgesList.forEach(edge => {
        const weight = parseInt(edge.label) || 0;
        slack[edge.id] = backwardPass[edge.to] - forwardPass[edge.from] - weight;
        
        if (slack[edge.id] === 0) {
            criticalPath.push(edge.id);
        }
    });
    
    return {
        forwardPass,
        backwardPass,
        slack,
        criticalPath
    };
}

function topologicalSort(nodeIds, edgesList) {
    const visited = new Set();
    const temp = new Set();
    const result = [];
    
    function visit(nodeId) {
        if (temp.has(nodeId)) throw new Error("Graph has cycles");
        if (visited.has(nodeId)) return;
        
        temp.add(nodeId);
        
        edgesList
            .filter(edge => edge.from === nodeId)
            .forEach(edge => visit(edge.to));
            
        temp.delete(nodeId);
        visited.add(nodeId);
        result.unshift(nodeId);
    }
    
    nodeIds.forEach(id => {
        if (!visited.has(id)) visit(id);
    });
    
    return result;
}

function visualizeCriticalPath(results) {
    const { forwardPass, backwardPass, slack, criticalPath } = results;
    
    const criticalNodes = new Set();
    edges.get(criticalPath).forEach(edge => {
        criticalNodes.add(edge.from);
        criticalNodes.add(edge.to);
    });
    
    nodes.get().forEach(node => {
        const isCritical = criticalNodes.has(node.id);
        nodes.update({
            id: node.id,
            color: isCritical ? '#E8FF00' : '#00E3C6',
            label: `${node.label}\n${forwardPass[node.id]} | ${backwardPass[node.id]}`
        });
    });
    
    edges.get().forEach(edge => {
        const weight = edge.label || "0";
        edges.update({
            id: edge.id,
            label: `${weight} | h = ${slack[edge.id]}`
        });
    });
    
    edges.get().forEach(edge => {
        const isCritical = criticalPath.includes(edge.id);
        edges.update({
            id: edge.id,
            color: isCritical ? '#E8FF00' : '#000000',
            width: isCritical ? 3 : 2
        });
    });
}

// RESOLVER
solve_btn.addEventListener('click', function() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    
    if (selectedAlgorithm === 'cpm') {
        try {
            const results = calculateCriticalPath();
            visualizeCriticalPath(results);
        } catch (error) {
            alert("Error calculating critical path: " + error.message);
        }
    } else if (selectedAlgorithm === 'grafo') {
        // Resetear
        nodes.get().forEach(node => {
            nodes.update({
                id: node.id,
                color: '#00E3C6',
                label: node.label.split('\n')[0]
            });
        });
        
        edges.get().forEach(edge => {
            edges.update({
                id: edge.id,
                color: '#000000',
                width: 2,
                label: edge.label.split(' | ')[0]
            });
        });
    }
    // 
});














updateAdjacencyMatrix();

function updateAdjacencyMatrix() {
    const matrix = graph.getAdjacencyMatrix();
    const nodeIds = nodes.getIds().sort((a, b) => a - b);
    const table = document.getElementById('tablaMatriz');
    
    table.innerHTML = '';
    
    const headerRow = document.createElement('tr');
    
    const cornerCell = document.createElement('th');
    cornerCell.className = 'empty-corner';
    headerRow.appendChild(cornerCell);
    
    nodeIds.forEach(id => {
        const node = nodes.get(id);
        const th = document.createElement('th');
        th.textContent = node.label || `Nodo ${id}`;
        headerRow.appendChild(th);
    });
    
    table.appendChild(headerRow);
    
    nodeIds.forEach((id, rowIndex) => {
        const row = document.createElement('tr');
        const node = nodes.get(id);
        
        const rowHeader = document.createElement('th');
        rowHeader.textContent = node.label || `Nodo ${id}`;
        row.appendChild(rowHeader);
        
        nodeIds.forEach((_, colIndex) => {
            const td = document.createElement('td');
            td.textContent = matrix[rowIndex][colIndex];
            row.appendChild(td);
        });
        
        table.appendChild(row);
    });
}


// Ver si ya existe un arco entre nodos
function edgeExists(from, to) {
    return edges.get().some(edge => 
        (edge.from === from && edge.to === to) || 
        (edge.from === to && edge.to === from)
    );
}

// Ver si la opción actual admite ciclos
function allowsCycles() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    return selectedAlgorithm === 'grafo';
}

// Cambios de selección de algoritmos
function handleAlgorithmChange() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    document.getElementById('currentAlgorithm').textContent = `Actual: ${
        selectedAlgorithm === 'grafo' ? 'Grafo' :
        selectedAlgorithm === 'cpm' ? 'Johnson' :
        selectedAlgorithm === 'Asignacion' ? 'Asignación' : 'Noroeste'
    }`;
    
    graph.clear();
    updateAdjacencyMatrix();
    
    // Ocultar/mostrar controles adicionales
    const checkboxGroup = document.getElementById('checkboxGroup1');
    if (selectedAlgorithm === 'Asignacion' || selectedAlgorithm === 'noroeste') {
        checkboxGroup.classList.remove('hidden');
    } else {
        checkboxGroup.classList.add('hidden');
    }
}


const currentAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
console.log('Current algorithm:', currentAlgorithm);


// Eventos para los Radio Buttons
document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
    radio.addEventListener('change', handleAlgorithmChange);
});

// Inicializar el display del algoritmo
handleAlgorithmChange();


// Funciones Generales
container.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('click', function(e) {
    if (e.button !== 2) { 
        nodeContextMenu.style.display = 'none';
    }
});