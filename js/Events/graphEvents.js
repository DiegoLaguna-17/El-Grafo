import Grafo from '../Algorithms/Grafo.js';
import CPM from '../Algorithms/CPM.js'; 

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

        if (selectedAlgorithm === 'cpm') {
            const cpmInstance = new CPM();
            cpmInstance.nodos = [...this.grafo.nodos];
            cpmInstance.arcos = [...this.grafo.arcos];
            cpmInstance.graphEvents = this.grafo.graphEvents;

            const result = cpmInstance.criticalPathMethod();
            if (result !== null) {
                this.highlightCriticalPath(result.criticalPath);
                this.displayCPMResult(result); 
            }
        } else {
            alert(`Algoritmo "${selectedAlgorithm}" aún no está implementado.`);
        }
    }

    highlightCriticalPath(criticalPath) {
        this.grafo.nodos.forEach(nodo => {
            nodo.color = nodo.color === "#E4FF00" ? "blue" : nodo.color;
        });
        this.grafo.arcos.forEach(arco => {
            arco.color = arco.color === "#E4FF00" ? "black" : arco.color; 
        });

        criticalPath.forEach(nodeId => {
            const nodo = this.grafo.nodos.find(n => n.id === nodeId);
            if (nodo) {
                nodo.color = "#E4FF00";
            }
        });

        for (let i = 0; i < criticalPath.length - 1; i++) {
            const fromNodeId = criticalPath[i];
            const toNodeId = criticalPath[i + 1];
            const arco = this.grafo.arcos.find(arco => arco.de === fromNodeId && arco.hacia === toNodeId);
            if (arco) {
                arco.color = "#E4FF00";
                
            }
        }
       
        this.grafo.dibujarGrafo();
    }
    
    resultadoAsignacion(asignaciones){
        asignaciones.forEach((a)=>{
            let color=generarColor();
            a.forEach((n)=>{
                const nodo = this.grafo.nodos.find(m => m.nombre === n);
                if (nodo) {
                    nodo.color = color;
                }
            }); 
        });
        function generarColor() {
            return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
        }
        this.grafo.dibujarGrafo();
    }






    displayASGResult(result) {
        const existingModal = document.querySelector('.asg-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.classList.add('asg-modal'); 
        modal.style.position = 'fixed';
        modal.style.bottom = '20px'; 
        modal.style.left = '20px'; 
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.border = '1px solid black';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        modal.style.zIndex = '1000';
        modal.style.maxWidth = '400px';
        modal.style.overflowX = 'auto';

        

        const content = document.createElement('div');
        content.innerHTML = `
            <h3>Resultado de Algoritmo de Asignacion</h3>
            <p><strong>Asigaciones:</strong> ${result.assignments}</p>
            <p><strong>Costo total de asignacion:</strong> ${result.totalCost}</p>
        `;
        modal.appendChild(content);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cerrar';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#FF0000';
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
















    displayCPMResult(result) {
        const existingModal = document.querySelector('.cpm-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.classList.add('cpm-modal'); 
        modal.style.position = 'fixed';
        modal.style.bottom = '20px'; 
        modal.style.left = '20px'; 
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.border = '1px solid black';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        modal.style.zIndex = '1000';
        modal.style.maxWidth = '400px';
        modal.style.overflowX = 'auto';

        const criticalPathNames = result.criticalPath.map(nodeId => {
            const nodo = this.grafo.nodos.find(n => n.id === nodeId);
            return nodo ? nodo.nombre : `Nodo ${nodeId}`;
        });

        const content = document.createElement('div');
        content.innerHTML = `
            <h3>Resultado para "Johnson" (Nodos amarillos)</h3>
            <p><strong> - Camino crítico:</strong> ${criticalPathNames.join(' → ')}</p>
        `;
        modal.appendChild(content);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cerrar';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#FF0000';
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