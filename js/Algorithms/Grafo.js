export default class Grafo {
    constructor() {
        this.nodos = []; 
        this.arcos = []; 
        this.nodoElegido = null; 
        this.nodoEdicion = null; 
        this.nodoEliminar = null; 
        this.nodoBucle = null; 
        this.svg = document.getElementById("canvas"); 
    }

    agregarNodo(x, y) {
        const id = this.nodos.length + 1;
        this.nodos.push({ id, x, y, nombre: `Nodo ${id}`, color: 'blue' });
        this.dibujarGrafo();
    }

    removerNodo(id) {
        this.nodos = this.nodos.filter(n => n.id !== id);
        this.arcos = this.arcos.filter(arc => arc.de !== id && arc.hacia !== id);
        this.dibujarGrafo();
    }

    agregarArco(de, hacia, valor = 1) {
        this.arcos.push({ de, hacia, valor });
        this.dibujarGrafo();
    }

    removerArco(de, hacia) {
        this.arcos = this.arcos.filter(arc => arc.de !== de && arc.hacia !== hacia);
        this.dibujarGrafo();
    }

    dibujarGrafo() {
        this.svg.innerHTML = ''; 
        this.arcos.forEach(arco => this.dibujarArco(arco));
        this.nodos.forEach(nodo => this.dibujarNodo(nodo));
        this.generarMatriz();
    }

    dibujarNodo(nodo) {
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("cx", nodo.x);
        circulo.setAttribute("cy", nodo.y);
        circulo.setAttribute("r", 30);
        circulo.setAttribute("class", "nodo");
        circulo.setAttribute("fill", nodo.color || "blue");

        circulo.addEventListener("mousedown", () => this.nodoElegido = nodo);
        circulo.addEventListener("mouseup", (e) => {
            if (this.nodoElegido && this.nodoElegido !== nodo) {
                this.agregarArco(this.nodoElegido.id, nodo.id);
            }
            this.nodoElegido = null;
        });

        const nombre = document.createElementNS("http://www.w3.org/2000/svg", "text");
        nombre.setAttribute("x", nodo.x);
        nombre.setAttribute("y", nodo.y);
        nombre.setAttribute("class", "id");
        nombre.setAttribute("fill", "white");
        nombre.setAttribute("text-anchor", "middle");
        nombre.setAttribute("dominant-baseline", "middle");
        nombre.textContent = nodo.nombre;

        this.svg.appendChild(circulo);
        this.svg.appendChild(nombre);
    }

    dibujarFlecha(x, y, angulo) {
        const tamañoFlecha = 10; 
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
        const x1 = x - tamañoFlecha * Math.cos(angulo - Math.PI / 6);
        const y1 = y - tamañoFlecha * Math.sin(angulo - Math.PI / 6);
        const x2 = x - tamañoFlecha * Math.cos(angulo + Math.PI / 6);
        const y2 = y - tamañoFlecha * Math.sin(angulo + Math.PI / 6);
    
        path.setAttribute("d", `M ${x} ${y} L ${x1} ${y1} L ${x2} ${y2} Z`);
        path.setAttribute("fill", "black"); 
        this.svg.appendChild(path);
    }

    dibujarArco(arco) {
        const deNodo = this.nodos.find(n => n.id === arco.de);
        const haciaNodo = this.nodos.find(n => n.id === arco.hacia);
    
        if (deNodo.id === haciaNodo.id) {
            // Bucle 
            const loop = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const x = deNodo.x;
            const y = deNodo.y;
            const radius = 30; 
    
            loop.setAttribute("cx", x);
            loop.setAttribute("cy", y - radius); 
            loop.setAttribute("r", radius);
            loop.setAttribute("stroke", "aqua");
            loop.setAttribute("stroke-width", "1.5");
            loop.setAttribute("fill", "none");
            loop.setAttribute("class", "arco");
    
            const arrowAngle = Math.PI; 
            const arrowX = x + radius * Math.cos(arrowAngle); 
            const arrowY = (y - radius) + radius * Math.sin(arrowAngle); 
            const tangentAngle = arrowAngle + Math.PI / 2; 
    
            this.svg.appendChild(loop);
    
            this.dibujarFlecha(arrowX, arrowY, tangentAngle);
    
            const pesoText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            pesoText.setAttribute("x", x); 
            pesoText.setAttribute("y", y - 2 * radius - 10); 
            pesoText.setAttribute("class", "peso");
            pesoText.textContent = arco.valor;
    
            loop.addEventListener("click", () => {
                const weight = prompt("Ingrese peso:", arco.valor);
                arco.valor = parseInt(weight) || 1;
                pesoText.textContent = arco.valor;
                this.dibujarGrafo();
            });
    
            this.svg.appendChild(pesoText);
        } else {
            // Arco curveado (Normal)
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const diferenciax = haciaNodo.x - deNodo.x;
            const diferenciay = haciaNodo.y - deNodo.y;
            const distancia = Math.sqrt(diferenciax * diferenciax + diferenciay * diferenciay);
            const offset = Math.max(30, distancia * 0.2);
            const perpendicularX = (diferenciay / distancia) * offset;
            const perpendicularY = -(diferenciax / distancia) * offset;
            const controlCurvaX = (deNodo.x + haciaNodo.x) / 2 + perpendicularX;
            const controlCurvaY = (deNodo.y + haciaNodo.y) / 2 + perpendicularY;
    
            path.setAttribute("d", `M ${deNodo.x} ${deNodo.y} Q ${controlCurvaX} ${controlCurvaY} ${haciaNodo.x} ${haciaNodo.y}`);
            path.setAttribute("class", "arco");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", diferenciax > 0 ? "green" : "red");
    
            this.svg.appendChild(path); 
    
            const radio = 30; 
            const minDistance = radio * 1.3; 
            const t = Math.max(0.85, 1 - (minDistance / distancia)); 
    
            const arrowX = Math.pow(1 - t, 2) * deNodo.x + 2 * (1 - t) * t * controlCurvaX + Math.pow(t, 2) * haciaNodo.x;
            const arrowY = Math.pow(1 - t, 2) * deNodo.y + 2 * (1 - t) * t * controlCurvaY + Math.pow(t, 2) * haciaNodo.y;
    
            const tangentX = 2 * (1 - t) * (controlCurvaX - deNodo.x) + 2 * t * (haciaNodo.x - controlCurvaX);
            const tangentY = 2 * (1 - t) * (controlCurvaY - deNodo.y) + 2 * t * (haciaNodo.y - controlCurvaY);
            const tangentAngle = Math.atan2(tangentY, tangentX);
    
            this.dibujarFlecha(arrowX, arrowY, tangentAngle);
    
            const peso = document.createElementNS("http://www.w3.org/2000/svg", "text");
            peso.setAttribute("x", controlCurvaX);
            peso.setAttribute("y", controlCurvaY);
            peso.setAttribute("class", "peso");
            peso.textContent = arco.valor;
    
            path.addEventListener("click", () => {
                const weight = prompt("Ingrese peso:", arco.valor);
                arco.valor = parseInt(weight) || 1;
                peso.textContent = arco.valor;
                this.dibujarGrafo();
            });
    
            this.svg.appendChild(peso);
        }
    }

    generarMatriz() {
        const tamaño = this.nodos.length;
        const matriz = Array(tamaño + 1).fill().map(() => Array(tamaño + 1).fill("0"));

        matriz[0][0] = " ";
        this.nodos.forEach((n, i) => {
            matriz[0][i + 1] = n.nombre;
            matriz[i + 1][0] = n.nombre;
        });

        this.arcos.forEach(e => {
            const origen = this.nodos.findIndex(n => n.id === e.de) + 1;
            const destino = this.nodos.findIndex(n => n.id === e.hacia) + 1;
            matriz[origen][destino] = e.valor;
        });

        const tabla = document.getElementById("tablaMatriz");
        tabla.innerHTML = "";
        matriz.forEach(fila => {
            const tr = document.createElement("tr");
            fila.forEach(celda => {
                const td = document.createElement(tr.children.length ? "td" : "th");
                td.textContent = celda;
                tr.appendChild(td);
            });
            tabla.appendChild(tr);
        });

        if (this.nodos.length > 7) {
            tabla.style = "font-size:1vh;padding:1px";
        }
    }

    vaciarCanvas() {
        this.svg.innerHTML = "";
        this.nodos = [];
        this.arcos = [];
        this.generarMatriz();
    }

    guardarGrafo() {
        const nombreArchivo = prompt("Ingrese el nombre para el archivo:", "");
        if (!nombreArchivo) return;

        const datos = { nodosJ: this.nodos, arcosJ: this.arcos };
        const jsonString = JSON.stringify(datos, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${nombreArchivo}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importarGrafo(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                this.nodos = jsonData.nodosJ || [];
                this.arcos = jsonData.arcosJ || [];
                this.dibujarGrafo();
                this.generarMatriz();
                alert("Archivo importado correctamente.");
                event.target.value = "";
            } catch (error) {
                alert("Error al leer el archivo JSON.");
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
}