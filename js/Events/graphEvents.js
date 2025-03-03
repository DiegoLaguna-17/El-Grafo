import Grafo from '../Algorithms/Grafo.js';

export default class GraphEvents {
    constructor(grafo) {
        this.grafo = grafo; // Instance of the Grafo class
        this.svg = document.getElementById("canvas"); // SVG canvas element
        this.menu = document.getElementById("menu"); // Context menu element
        this.nodoElegido = null; // Selected node for edge creation
        this.nodoEdicion = null; // Node being edited
        this.nodoEliminar = null; // Node to be deleted
        this.nodoBucle = null; // Node for adding loops

        // Initialize event listeners
        this.inicializarEventos();
    }

    // Initialize event listeners
    inicializarEventos() {
        // Double-click to add a node
        this.svg.addEventListener("dblclick", (e) => this.posicionarNodo(e));

        // Right-click to show context menu
        this.svg.addEventListener("contextmenu", (e) => this.mostrarMenuContextual(e));

        // Click outside to hide context menu
        document.addEventListener("click", () => {
            this.menu.style.display = "none";
        });

        // Add event listeners for context menu buttons
        document.getElementById("agregarBucleBtn").addEventListener("click", () => this.agregarBucle());
        document.getElementById("cambiarNombreBtn").addEventListener("click", () => this.cambiarNombre());
        document.getElementById("colorPicker").addEventListener("change", (e) => this.cambiarColor(e.target.value));
        document.getElementById("eliminarNodoBtn").addEventListener("click", () => this.eliminarNodo());
    }

    // Add a node at the clicked position
    posicionarNodo(event) {
        const rect = this.svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.grafo.agregarNodo(x, y);
    }

    // Show context menu for node editing
    mostrarMenuContextual(event) {
        event.preventDefault();
        const rect = this.svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find the clicked node
        this.nodoEdicion = this.grafo.nodos.find(n => Math.hypot(n.x - x, n.y - y) < 30);
        this.nodoEliminar = this.nodoEdicion;
        this.nodoBucle = this.nodoEdicion;

        if (this.nodoEdicion) {
            this.menu.style.left = `${event.clientX}px`;
            this.menu.style.top = `${event.clientY}px`;
            this.menu.style.display = "block";
        } else {
            this.menu.style.display = "none";
        }
    }

    // Add a loop to the selected node
    agregarBucle() {
        if (this.nodoBucle) {
            this.grafo.agregarArco(this.nodoBucle.id, this.nodoBucle.id);
        }
    }

    // Change the name of the selected node
    cambiarNombre() {
        if (this.nodoEdicion) {
            const nuevoNombre = prompt("Ingrese nuevo nombre:", this.nodoEdicion.nombre);
            if (nuevoNombre) {
                this.nodoEdicion.nombre = nuevoNombre;
                this.grafo.dibujarGrafo();
            }
        }
    }

    // Change the color of the selected node
    cambiarColor(color) {
        if (this.nodoEdicion) {
            this.nodoEdicion.color = color;
            this.grafo.dibujarGrafo();
        }
    }

    // Remove the selected node
    eliminarNodo() {
        if (this.nodoEliminar) {
            this.grafo.removerNodo(this.nodoEliminar.id);
        }
    }
}