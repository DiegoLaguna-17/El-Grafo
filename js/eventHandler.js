import Graph from './Graph.js';

const container = document.getElementById('network');
const nodeContextMenu = document.getElementById('nodeContextMenu');
const nodes = new vis.DataSet([]);
const edges = new vis.DataSet([]);

const options = {
    nodes: {
        shape: 'circle',
        color: '#00E3C6',
        size: 30,
        scaling: {
            min: 30,
            max: 30,
            label: {
                enabled: false
            }
        },
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

// Variables Auxiliares
const addLoopBtn = document.getElementById('addLoopBtn');
const changeLabelBtn = document.getElementById('changeLabelBtn');
const nodeColorPicker = document.getElementById('nodeColorPicker');
const deleteNodeBtn = document.getElementById('deleteNodeBtn');
const vaciarBtn = document.getElementById('vaciarBtn');
const guardarGrafo = document.getElementById('guardarGrafo');
const importarDato = document.getElementById('importarDato');
const solve_btn = document.getElementById('solve-btn'); 
const edgeContextButton = document.getElementById('edgeContextButton');
const changeWeightBtn = document.getElementById('changeWeightBtn');

const addValueBtn = document.createElement('button');
addValueBtn.id = 'addValueBtn';
addValueBtn.textContent = 'Agregar valor';
nodeContextMenu.appendChild(addValueBtn);

let isCreatingEdge = false;
let sourceNodeId = null;
let selectedNodeId = null;
let selectedEdgeId = null;
let edgeButtonTimeout = null;

// Color palette for assignments
const colorPalette = [
    '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', 
    '#B5EAD7', '#C7CEEA', '#F8B195', '#F67280',
    '#C06C84', '#6C5B7B', '#355C7D', '#A8E6CE'
];

// Modal para asignación
const modalHTML = `
<div id="assignmentModal" class="modal" style="display: none;">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>Resultado Asignación</h3>
        <div id="assignmentResults"></div>
    </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

const modalStyles = `
.modal {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background-color: #333;
    border-radius: 8px;
    padding: 15px;
    color: white;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    max-width: 300px;
}

.modal-content {
    position: relative;
}

.close-modal {
    position: absolute;
    top: -10px;
    right: -10px;
    color: white;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
}

.close-modal:hover {
    color: #B2A1FF;
}

#assignmentResults {
    margin-top: 10px;
}

.assignment-item {
    margin: 5px 0;
    padding: 5px;
    border-bottom: 1px solid #444;
}

.total-cost {
    margin-top: 10px;
    font-weight: bold;
    padding-top: 5px;
    border-top: 2px solid #B2A1FF;
}
`;
const styleElement = document.createElement('style');
styleElement.innerHTML = modalStyles;
document.head.appendChild(styleElement);

// Event Handlers
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
    }, 900);
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

network.on("click", function(params) {
    if (params.nodes.length === 0 && params.edges.length === 0) {
        const pointerPosition = params.pointer.canvas;
        const newNodeId = nodes.length + 1; 
        nodes.add({
            id: newNodeId,
            label: `Nodo ${newNodeId}`,
            x: pointerPosition.x,
            y: pointerPosition.y,
            value: 0,
        });
        updateAdjacencyMatrix();
    }
});

network.on('doubleClick', function(params) {
    if (params.nodes.length === 1) {
        if (!isCreatingEdge) {
            sourceNodeId = params.nodes[0];
            isCreatingEdge = true;
        } else {
            const destinationNodeId = params.nodes[0];
            
            if (sourceNodeId !== destinationNodeId) {
                if (!allowsCycles() && edgeExists(sourceNodeId, destinationNodeId)) {
                    alert('No se permiten múltiples aristas entre nodos en este modo de algoritmo');
                } else {
                    edges.add({
                        from: sourceNodeId,
                        to: destinationNodeId,
                        label: "0",
                        arrows: 'to',
                    });
                    updateAdjacencyMatrix();
                }
            } else {
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
    updateContextMenuVisibility();
});

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

nodeColorPicker.addEventListener('input', function(e) {
    if (selectedNodeId) {
        graph.updateNode(selectedNodeId, { color: e.target.value });
    }
});

deleteNodeBtn.addEventListener('click', function() {
    if (selectedNodeId) {
        graph.removeNode(selectedNodeId);
        nodeContextMenu.style.display = 'none';
        updateAdjacencyMatrix();
    }
});

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
    const fileName = prompt("Nombre del archivo:", "graph");
    downloadLink.download = (fileName || 'graph') + '.json';
    
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

        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// Algorithm Implementations
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

// Modal para Johnson
const criticalPathModalHTML = `
<div id="criticalPathModal" class="modal" style="display: none; bottom: 20px; left: 20px; cursor: pointer;">
    <div class="modal-content">
        <span class="close-critical-path-modal">&times;</span>
        <h3 style="color: yellow;">Solución</h3>
        <div id="criticalPathNodes"></div>
    </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', criticalPathModalHTML);

function visualizeCriticalPath(results) {
    const { forwardPass, backwardPass, slack, criticalPath } = results;
    
    const criticalNodes = new Set();
    const nodeOrder = [];
    
    // Get all edges in the critical path
    const criticalEdges = edges.get(criticalPath);
    
    // Find the starting node (node with no incoming critical edges)
    let currentNode = null;
    for (const edge of criticalEdges) {
        const isStartNode = !criticalEdges.some(e => e.to === edge.from);
        if (isStartNode) {
            currentNode = edge.from;
            break;
        }
    }
    
    // If we didn't find a start node, just pick the first one
    if (!currentNode && criticalEdges.length > 0) {
        currentNode = criticalEdges[0].from;
    }
    
    // Reconstruct the path by following the edges
    const pathNodes = [];
    if (currentNode) {
        pathNodes.push(currentNode);
        criticalNodes.add(currentNode);
        
        while (true) {
            const nextEdge = criticalEdges.find(e => e.from === currentNode);
            if (!nextEdge) break;
            
            currentNode = nextEdge.to;
            pathNodes.push(currentNode);
            criticalNodes.add(currentNode);
        }
    }
    
    // Color nodes and edges
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
    
    // Show critical path in modal
    const modal = document.getElementById('criticalPathModal');
    const pathDiv = document.getElementById('criticalPathNodes');
    
    // Format the path as "Node 1 -> Node 2 -> ..."
    const pathText = pathNodes.map(id => {
        const node = nodes.get(id);
        return node.label ? node.label.split('\n')[0] : `Node ${id}`;
    }).join(' → ');
    
    pathDiv.textContent = pathText;
    modal.style.display = 'block';
    
    // Close modal handler
    document.querySelector('.close-critical-path-modal').onclick = function() {
        modal.style.display = 'none';
    };
}

function hungarianAlgorithm(isMaximization) {
    const nodeIds = nodes.getIds().sort((a, b) => a - b);
    const matrix = graph.getAdjacencyMatrix();
    
    if (nodeIds.length === 0) {
        throw new Error("No hay nodos en el grafo");
    }

    // Separate origins (first half) and destinations (second half)
    const half = Math.ceil(nodeIds.length / 2);
    const origins = nodeIds.slice(0, half);
    const destinations = nodeIds.slice(half);
    
    // Create cost matrix with destinations as rows and origins as columns
    const costMatrix = destinations.map(toId => {
        const toIndex = nodeIds.indexOf(toId);
        return origins.map(fromId => {
            const fromIndex = nodeIds.indexOf(fromId);
            const cost = parseInt(matrix[fromIndex][toIndex]) || 0;
            return isMaximization ? -cost : cost; // Handle maximization by negating costs
        });
    });

    // Pad matrix to make it square if needed
    const maxSize = Math.max(origins.length, destinations.length);
    while (costMatrix.length < maxSize) {
        costMatrix.push(new Array(origins.length).fill(0));
    }
    costMatrix.forEach(row => {
        while (row.length < origins.length) {
            row.push(0);
        }
    });

    // Step 1: Subtract row minima
    costMatrix.forEach(row => {
        const min = Math.min(...row);
        row.forEach((val, j) => {
            row[j] = val - min;
        });
    });

    // Step 2: Subtract column minima
    for (let j = 0; j < origins.length; j++) {
        const column = costMatrix.map(row => row[j]);
        const min = Math.min(...column);
        costMatrix.forEach(row => {
            row[j] -= min;
        });
    }

    // Find optimal assignment (now assigning destinations to origins)
    const assignment = findOptimalAssignment(costMatrix);

    // Prepare results with proper costs
    const assignments = [];
    let totalCost = 0;

    for (let destIndex = 0; destIndex < Math.min(destinations.length, origins.length); destIndex++) {
        const originIndex = assignment[destIndex];
        if (originIndex === undefined || originIndex >= origins.length) continue;

        const fromId = origins[originIndex];
        const toId = destinations[destIndex];
        const fromNode = nodes.get(fromId);
        const toNode = nodes.get(toId);
        
        // Get original cost from adjacency matrix
        const fromIndex = nodeIds.indexOf(fromId);
        const toIndex = nodeIds.indexOf(toId);
        const originalCost = parseInt(matrix[fromIndex][toIndex]) || 0;

        assignments.push({
            from: fromId,
            fromLabel: fromNode.label,
            to: toId,
            toLabel: toNode.label,
            cost: originalCost
        });

        totalCost += originalCost;
    }

    return { assignments, totalCost };
}

function findOptimalAssignment(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0]?.length || 0;
    const assignment = new Array(numRows).fill(-1);
    const rowCovered = new Array(numRows).fill(false);
    const colCovered = new Array(numCols).fill(false);
    
    // Find initial assignments
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (matrix[i][j] === 0 && !rowCovered[i] && !colCovered[j]) {
                assignment[i] = j;
                rowCovered[i] = true;
                colCovered[j] = true;
                break;
            }
        }
    }
    
    // Handle unassigned rows
    for (let i = 0; i < numRows; i++) {
        if (assignment[i] === -1) {
            for (let j = 0; j < numCols; j++) {
                if (!colCovered[j]) {
                    assignment[i] = j;
                    colCovered[j] = true;
                    break;
                }
            }
        }
    }
    
    return assignment;
}

function visualizeAssignments(results) {
    const { assignments, totalCost } = results;
    
    // Reset all node colors
    nodes.get().forEach(node => {
        nodes.update({
            id: node.id,
            color: '#00E3C6'
        });
    });

    // Color assigned pairs
    assignments.forEach((pair, index) => {
        const color = colorPalette[index % colorPalette.length];
        nodes.update([
            { id: pair.from, color: color },
            { id: pair.to, color: color }
        ]);
    });

    // Show results in modal
    const modal = document.getElementById('assignmentModal');
    const resultsDiv = document.getElementById('assignmentResults');
    
    resultsDiv.innerHTML = assignments.map(pair => {
        return `
            <div class="assignment-item">
                ${pair.fromLabel} → ${pair.toLabel} = ${pair.cost}
            </div>
        `;
    }).join('') + `
        <div class="total-cost">
            Costo Total = ${isNaN(totalCost) ? 0 : totalCost}
        </div>
    `;
    
    modal.style.display = 'block';
    
    document.querySelector('.close-modal').onclick = function() {
        modal.style.display = 'none';
    };
}

// Modal Noroeste
const northwestModalHTML = `
<div id="northwestModal" class="modal" style="display: none;">
    <div class="modal-content">
        <span class="close-northwest-modal">&times;</span>
        <h3>Resultado Noroeste</h3>
        <div id="northwestResults">
            <p>Iteraciones: <span id="iterationCount">0</span></p>
            <p>Costo total = <span id="northwestTotalCost">0</span></p>
        </div>
    </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', northwestModalHTML);

// Northwest Corner Algorithm Implementation
function northwestCornerAlgorithm(isMaximization) {
    const nodeIds = nodes.getIds().sort((a, b) => a - b);
    const matrix = graph.getAdjacencyMatrix();
    
    if (nodeIds.length === 0) {
        throw new Error("No hay nodos en el grafo");
    }

    // Identify supply (origin) and demand (destination) nodes based on edge connections
    const origins = new Set();
    const destinations = new Set();
    
    edges.get().forEach(edge => {
        origins.add(edge.from);
        destinations.add(edge.to);
    });

    // Convert to arrays
    const supplyNodes = Array.from(origins);
    const demandNodes = Array.from(destinations);

    // Get supply and demand values from node attributes
    const supplies = supplyNodes.map(id => graph.getSupplyDemandValue(id));
    const demands = demandNodes.map(id => graph.getSupplyDemandValue(id));

    // Check if total supply equals total demand
    const totalSupply = supplies.reduce((a, b) => a + b, 0);
    const totalDemand = demands.reduce((a, b) => a + b, 0);
    
    if (totalSupply !== totalDemand) {
        throw new Error(`La oferta total (${totalSupply}) no coincide con la demanda total (${totalDemand})`);
    }

    // Create cost matrix with supply nodes as rows and demand nodes as columns
    const costMatrix = supplyNodes.map((fromId, i) => {
        const fromIndex = nodeIds.indexOf(fromId);
        return demandNodes.map((toId, j) => {
            const toIndex = nodeIds.indexOf(toId);
            const cost = parseInt(matrix[fromIndex][toIndex]) || 0;
            return cost; // Always use original cost, we'll handle maximization differently
        });
    });

    // Initialize variables
    const allocations = Array(supplyNodes.length).fill().map(() => Array(demandNodes.length).fill(0));
    let totalCost = 0;
    let iterations = 0;
    let i = 0, j = 0;

    // For maximization, we need to find the maximum possible total cost
    if (isMaximization) {
        // Create a copy of the cost matrix sorted in descending order
        const sortedCosts = [];
        for (let i = 0; i < supplyNodes.length; i++) {
            for (let j = 0; j < demandNodes.length; j++) {
                sortedCosts.push({
                    i, j,
                    cost: costMatrix[i][j]
                });
            }
        }
        sortedCosts.sort((a, b) => b.cost - a.cost); // Sort descending
        
        // Make copies of supplies and demands that we can modify
        const remainingSupplies = [...supplies];
        const remainingDemands = [...demands];
        
        // Assign allocations starting from the highest cost
        for (const {i, j, cost} of sortedCosts) {
            if (remainingSupplies[i] <= 0 || remainingDemands[j] <= 0) continue;
            
            const allocation = Math.min(remainingSupplies[i], remainingDemands[j]);
            allocations[i][j] = allocation;
            totalCost += allocation * cost;
            
            remainingSupplies[i] -= allocation;
            remainingDemands[j] -= allocation;
            iterations++;
        }
    } 
    // For minimization (original northwest corner algorithm)
    else {
        // Northwest Corner algorithm
        while (i < supplyNodes.length && j < demandNodes.length) {
            iterations++;
            const supply = supplies[i];
            const demand = demands[j];
            
            if (supply <= 0 || demand <= 0) {
                // Skip if no supply or demand left
                if (supply <= 0) i++;
                if (demand <= 0) j++;
                continue;
            }
            
            const allocation = Math.min(supply, demand);
            allocations[i][j] = allocation;
            
            // Update supply and demand
            supplies[i] -= allocation;
            demands[j] -= allocation;
            
            // Calculate cost
            totalCost += allocation * costMatrix[i][j];
            
            // Move to next cell
            if (supplies[i] === 0) i++;
            if (demands[j] === 0) j++;
        }
    }

    return {
        totalCost,
        iterations
    };
}

function visualizeNorthwestResults(results) {
    const { totalCost, iterations } = results;
    
    // Color all nodes orange to indicate algorithm was applied
    nodes.get().forEach(node => {
        nodes.update({
            id: node.id,
            color: '#FF6800'
        });
    });

    // Show results in modal
    const modal = document.getElementById('northwestModal');
    const resultsDiv = document.getElementById('northwestResults');
    
    resultsDiv.innerHTML = `
        <p>Iteraciones: <span id="iterationCount">${iterations}</span></p>
        <p>Costo total = <span id="northwestTotalCost">${totalCost}</span></p>
    `;
    
    modal.style.display = 'block';
    
    document.querySelector('.close-northwest-modal').onclick = function() {
        modal.style.display = 'none';
    };
}

solve_btn.addEventListener('click', function() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    
    if (selectedAlgorithm === 'cpm') {
        try {
            const results = calculateCriticalPath();
            visualizeCriticalPath(results);
        } catch (error) {
            alert("Error calculating critical path: " + error.message);
        }
    } else if (selectedAlgorithm === 'Asignacion') {
        try {
            const isMaximization = document.querySelector('input[name="check"]:checked').value === 'true';
            const results = hungarianAlgorithm(isMaximization);
            visualizeAssignments(results);
        } catch (error) {
            alert("Error in assignment algorithm: " + error.message);
        }
    } else if (selectedAlgorithm === 'noroeste') {
        try {
            const isMaximization = document.querySelector('input[name="check"]:checked').value === 'true';
            const results = northwestCornerAlgorithm(isMaximization);
            visualizeNorthwestResults(results);
        } catch (error) {
            alert("Error in Northwest algorithm: " + error.message);
        }
    } else if (selectedAlgorithm === 'grafo') {
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
        
        document.getElementById('criticalPathModal').style.display = 'none';
        document.getElementById('assignmentModal').style.display = 'none';
        document.getElementById('northwestModal').style.display = 'none';
    }
});

// Helper Functions
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

function edgeExists(from, to) {
    return edges.get().some(edge => 
        (edge.from === from && edge.to === to) || 
        (edge.from === to && edge.to === from)
    );
}

function allowsCycles() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    return selectedAlgorithm === 'grafo';
}

function handleAlgorithmChange() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    document.getElementById('currentAlgorithm').textContent = `Actual: ${
        selectedAlgorithm === 'grafo' ? 'Grafo' :
        selectedAlgorithm === 'cpm' ? 'Johnson' :
        selectedAlgorithm === 'Asignacion' ? 'Asignación' : 'Noroeste'
    }`;
    
    graph.clear();
    updateAdjacencyMatrix();
    
    const checkboxGroup = document.getElementById('checkboxGroup1');
    if (selectedAlgorithm === 'Asignacion' || selectedAlgorithm === 'noroeste') {
        checkboxGroup.classList.remove('hidden');
    } else {
        checkboxGroup.classList.add('hidden');
    }
}

document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
    radio.addEventListener('change', handleAlgorithmChange);
});

handleAlgorithmChange();

container.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('click', function(e) {
    if (e.button !== 2) { 
        nodeContextMenu.style.display = 'none';
    }
});

addValueBtn.addEventListener('click', function() {
    if (selectedNodeId) {
        const currentValue = graph.getSupplyDemandValue(selectedNodeId);
        const newValue = prompt('Ingrese valor de oferta/demanda:', currentValue);
        if (newValue !== null) {
            graph.setSupplyDemandValue(selectedNodeId, newValue);
            
            // Update node label
            const node = nodes.get(selectedNodeId);
            const isSupply = edges.get().some(edge => edge.from === selectedNodeId);
            const prefix = isSupply ? 'S=' : 'D=';
            nodes.update({
                id: selectedNodeId,
                label: `Nodo ${selectedNodeId} ${prefix}${newValue}`
            });
        }
        nodeContextMenu.style.display = 'none';
    }
});

function updateContextMenuVisibility() {
    const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    addValueBtn.style.display = selectedAlgorithm === 'noroeste' ? 'block' : 'none';
}

document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
    radio.addEventListener('change', updateContextMenuVisibility);
});