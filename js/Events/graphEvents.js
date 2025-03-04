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
}