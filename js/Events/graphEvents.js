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
            this.grafo.agregarArco(this.grafo.nodoBucle.id, this.grafo.nodoBucle.id);
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
}