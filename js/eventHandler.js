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
        arrows: {
            to: { enabled: true, scaleFactor: 1.5 },
        },
    },
};

const data = { nodes, edges };
const network = new vis.Network(container, data, options);
const graph = new Graph(nodes, edges);

// Variables Auxiliares
const addLoopBtn = document.getElementById('addLoopBtn');
const changeLabelBtn = document.getElementById('changeLabelBtn');
const nodeColorPicker = document.getElementById('nodeColorPicker');
const deleteNodeBtn = document.getElementById('deleteNodeBtn');

const vaciarBtn = document.getElementById('vaciarBtn');
const guardarGrafo = document.getElementById('guardarGrafo');
const importarDato = document.getElementById('importarDato');
const solve_btn = document.getElementById('solve-btn'); 

let isCreatingEdge = false;
let sourceNodeId = null;
let selectedNodeId = null;

// Agregar Nodo
network.on("click", function(params) {
    if (params.nodes.length === 0) {
        const pointerPosition = params.pointer.canvas;
        const newNodeId = nodes.length + 1; 
        nodes.add({
            id: newNodeId,
            label: `Nodo ${newNodeId}`,
            x: pointerPosition.x,
            y: pointerPosition.y,
        });
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
                edges.add({
                    from: sourceNodeId,
                    to: destinationNodeId,
                    label: `Clickable Label`,
                    arrows: 'to',
                });
                console.log(`Arco creado desde Nodo ${sourceNodeId} hacia ${destinationNodeId}`);
            } else {
                console.log('No se pueden crear bucles ahora.');
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
        edges.add({
            from: selectedNodeId,
            to: selectedNodeId,
            label: 'Bucle',
            arrows: 'to'
        });
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
    }
});

// ***** Botones de Control *****
vaciarBtn.addEventListener('click', function() {
    graph.clear();
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
            graph.clear();
            
            nodes.add(graphData.nodes);
            edges.add(graphData.edges);
            
            console.log('Graph imported successfully');

        } catch (error) {
            console.error('Error loading graph:', error);
            alert('Error loading graph: ' + error.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

solve_btn.addEventListener('click', function() {
    console.log('Current adjacency matrix:', graph.getAdjacencyMatrix());
});

const currentAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
console.log('Current algorithm:', currentAlgorithm);

// Funciones Generales
container.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('click', function(e) {
    if (e.button !== 2) { 
        nodeContextMenu.style.display = 'none';
    }
});