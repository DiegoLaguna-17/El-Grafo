import Grafo from '../Algorithms/Grafo.js';

export default class GraphEvents {
    constructor(grafo) {
        this.grafo = grafo; 
        this.svg = document.getElementById("canvas"); 
        this.menu = document.getElementById("menu"); 
        this.inicializarEventos();
    }

    inicializarEventos() {
        this.svg.addEventListener("dblclick", (e) => this.posicionarNodo(e));

        this.svg.addEventListener("contextmenu", (e) => this.mostrarMenuContextual(e));

        document.addEventListener("click", () => {
            this.menu.style.display = "none";
        });

        document.getElementById("agregarBucleBtn").addEventListener("click", () => this.agregarBucle());
        document.getElementById("cambiarNombreBtn").addEventListener("click", () => this.cambiarNombre());
        document.getElementById("colorPicker").addEventListener("change", (e) => this.cambiarColor(e.target.value));
        document.getElementById("eliminarNodoBtn").addEventListener("click", () => this.eliminarNodo());

        this.svg.addEventListener("mouseup", (e) => this.crearArco(e));

        document.getElementById("solve-btn").addEventListener("click", () => this.solveGraph());
    }

    posicionarNodo(event) {
        const rect = this.svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.grafo.agregarNodo(x, y);
    }

    mostrarMenuContextual(event) {
        event.preventDefault();
        const rect = this.svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.grafo.nodoEdicion = this.grafo.nodos.find(n => Math.hypot(n.x - x, n.y - y) < 30);
        this.grafo.nodoEliminar = this.grafo.nodoEdicion;
        this.grafo.nodoBucle = this.grafo.nodoEdicion;

        if (this.grafo.nodoEdicion) {
            this.menu.style.left = `${event.clientX}px`;
            this.menu.style.top = `${event.clientY}px`;
            this.menu.style.display = "block";
        } else {
            this.menu.style.display = "none";
        }
    }

    agregarBucle() {
        if (this.grafo.nodoBucle) {
            if (this.grafo.tieneBucle(this.grafo.nodoBucle.id)) {
                alert("Ya existe un bucle en este nodo. No se puede agregar otro.");
                return;
            }
            this.grafo.agregarArco(this.grafo.nodoBucle.id, this.grafo.nodoBucle.id, "?"); 
        }
    }

    cambiarNombre() {
        if (this.grafo.nodoEdicion) {
            const nuevoNombre = prompt("Ingrese nuevo nombre:", this.grafo.nodoEdicion.nombre);
            if (nuevoNombre) {
                this.grafo.nodoEdicion.nombre = nuevoNombre;
                this.grafo.dibujarGrafo();
            }
        }
    }

    cambiarColor(color) {
        if (this.grafo.nodoEdicion) {
            this.grafo.nodoEdicion.color = color;
            this.grafo.dibujarGrafo();
        }
    }

    eliminarNodo() {
        if (this.grafo.nodoEliminar) {
            this.grafo.removerNodo(this.grafo.nodoEliminar.id);
        }
    }

    crearArco(event) {
        const rect = this.svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const nodo = this.grafo.nodos.find(n => Math.hypot(n.x - x, n.y - y) < 30);

        if (this.grafo.nodoElegido && this.grafo.nodoElegido !== nodo) {
            if (this.grafo.tieneArco(this.grafo.nodoElegido.id, nodo.id)) {
                alert("Ya existe un arco entre estos nodos. No se puede agregar otro.");
                return;
            }
            this.grafo.agregarArco(this.grafo.nodoElegido.id, nodo.id);
            this.solicitarPeso(this.grafo.arcos[this.grafo.arcos.length - 1]); 
        }
        this.grafo.nodoElegido = null;
    }

    solicitarPeso(arco) {
        let peso = prompt("Ingrese el peso del arco (debe ser un número entero):", "1");
        while (isNaN(peso) || peso === "") {
            alert("El peso debe ser un número entero. Intente nuevamente.");
            peso = prompt("Ingrese el peso del arco (debe ser un número entero):", "1");
        }

        arco.valor = parseInt(peso);
        this.grafo.dibujarGrafo();
    }



    solveGraph() {
        const selectedAlgorithm = document.querySelector('input[name="algorithm"]:checked').value;
    
        if (selectedAlgorithm === 'johnson') {
            if (this.grafo instanceof Johnson) {
                // Copiar el estado actual de Grafo -> Johnson
                this.grafo.nodos = [...this.grafo.nodos];
                this.grafo.arcos = [...this.grafo.arcos];
    
                // Resolver por Johnson
                const shortestPaths = this.grafo.johnsonsAlgorithm();
                if (shortestPaths !== null) {
                    this.displaySolutionMatrix(shortestPaths);
                }
            } else {
                alert("Johnson no es aplicable para este grafo.");
            }
        } else {
            alert(`Algoritmo "${selectedAlgorithm}" aún no está implementado.`);
        }
    }

    displaySolutionMatrix(shortestPaths) {
        // Modal
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.border = '1px solid black';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        modal.style.zIndex = '1000';
        modal.style.maxWidth = '90%';
        modal.style.overflowX = 'auto';
    
        // Matriz de solución
        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        table.style.textAlign = 'center';
    
        // Títulos (headers)
        const headerRow = document.createElement('tr');
        const emptyHeader = document.createElement('th'); 
        emptyHeader.style.border = '1px solid black';
        emptyHeader.style.padding = '10px';
        emptyHeader.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(emptyHeader);
    
        this.grafo.nodos.forEach((nodo, index) => {
            const th = document.createElement('th');
            th.textContent = nodo.nombre;
            th.style.border = '1px solid black';
            th.style.padding = '10px';
            th.style.backgroundColor = '#f2f2f2';
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
    
        // Valores
        shortestPaths.forEach((distances, index) => {
            const row = document.createElement('tr');
    
            const nodeCell = document.createElement('td');
            nodeCell.textContent = this.grafo.nodos[index].nombre;
            nodeCell.style.border = '1px solid black';
            nodeCell.style.padding = '10px';
            nodeCell.style.backgroundColor = '#f2f2f2';
            row.appendChild(nodeCell);
    
            Object.values(distances).forEach(distance => {
                const cell = document.createElement('td');
                cell.textContent = distance === Infinity ? '∞' : distance; // ∞ es para nodos inalcanzables
                cell.style.border = '1px solid black';
                cell.style.padding = '10px';
                row.appendChild(cell);
            });
    
            table.appendChild(row);
        });
    
        modal.appendChild(table);
    
        // Botón
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#007BFF';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        modal.appendChild(closeButton);
    
        document.body.appendChild(modal);
    }
}