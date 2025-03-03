let nodos = [],
    arcos = [],
    nodoElegido = null,
    nodoEdicion = null,
    nodoEliminar = null,
    nodoBucle = null;

const menu = document.getElementById("menu");
const svg = document.getElementById("canvas");
const btnVaciar = document.getElementById("vaciarBtn");
const btnGuardarGrafo = document.getElementById("guardarGrafo");
const btnImportarGrafo = document.getElementById("importarDato");

// Event Listeners
btnVaciar.addEventListener("click", vaciarCanvas);
btnGuardarGrafo.addEventListener("click", guardarGrafo);
btnImportarGrafo.addEventListener("click", abrirArchivo);

svg.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    mostrarMenuContextual(e);
});

svg.addEventListener("dblclick", (e) => posicionarNodo(e));

document.addEventListener("click", () => {
    menu.style.display = "none";
});

// Functions
function posicionarNodo(e) {
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = nodos.length + 1;
    if (nodos.length < 12) {
        nodos.push({ id, x, y, nombre: `Nodo ${id}`, color: 'blue' });
        dibujarNodos();
        generarMatriz();
    }
}

function mostrarMenuContextual(e) {
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    nodoEdicion = nodos.find(n => Math.hypot(n.x - x, n.y - y) < 100);
    nodoEliminar = nodos.find(n => Math.hypot(n.x - x, n.y - y) < 100);
    nodoBucle = nodos.find(n => Math.hypot(n.x - x, n.y - y) < 100);

    if (nodoEdicion || nodoEliminar) {
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

// Agregar un bucle a un nodo
function agregarBucle(){
    const nodoB = nodoBucle.id;
    arcos.push({ de: nodoB, hacia: nodoB, valor: 1 });
    dibujarNodos();
}

// Cambiar el nombre de un nodo
function cambiarNombre() {
    const nuevoNombre = prompt("Ingrese nuevo nombre:", nodoEdicion.nombre);
    if (nuevoNombre) {
        nodoEdicion.nombre = nuevoNombre;
        dibujarNodos();
        generarMatriz();
    }
}

// Cambiar el color de un nodo
function cambiarColor(color) {
    if (nodoEdicion) {
        nodoEdicion.color = color;
        dibujarNodos();
    }
}

// Eliminar un nodo
function eliminarNodo() {
    const nodoE = nodoEliminar.id;
    nodos = nodos.filter(n => n.id !== nodoE);
    arcos = arcos.filter(arc => arc.de !== nodoE && arc.hacia !== nodoE);
    dibujarNodos();
    generarMatriz();
}

// Dibujar los nodos
function dibujarNodos() {
    svg.innerHTML = `
        <defs>
            <marker id="arrow" markerWidth="15" markerHeight="10" refX="15" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,10 L15,5 Z"  />
            </marker>
        </defs>`;
        
    arcos.forEach(dibujarArco);
    nodos.forEach(n => {
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("cx", n.x);
        circulo.setAttribute("cy", n.y);
        circulo.setAttribute("r", 30);
        circulo.setAttribute("class", "nodo");
        circulo.setAttribute("fill", n.color || "blue");
        
        
        // Evento para agregar arista con mouseup
        circulo.addEventListener("mousedown", () => nodoElegido = n);
        circulo.addEventListener("mouseup", (e) => {
            if (nodoElegido && nodoElegido !== n) {
                arcos.push({ de: nodoElegido.id, hacia: n.id, valor: 1 });
                dibujarNodos();
            }
            nodoElegido = null;
        });

        const nombre = document.createElementNS("http://www.w3.org/2000/svg", "text");
        nombre.setAttribute("x", n.x);
        nombre.setAttribute("y", n.y);
        nombre.setAttribute("class", "id");
        nombre.textContent = n.nombre;
        
        svg.appendChild(circulo);
        svg.appendChild(nombre);
    });
}

// Dibujar los arcos
function dibujarArco(arc) {
    const deNodo = nodos.find(n => n.id === arc.de);
    const haciaNodo = nodos.find(n => n.id === arc.hacia);

    if(deNodo.id == haciaNodo.id){
        
        const radioBucle = 40;
        const x = deNodo.x;
        const y = deNodo.y;
        const pesoText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        
        // Crear un arco usando un path
        const loop= document.createElementNS("http://www.w3.org/2000/svg", "path");
        if (x < 500) {
            loop.setAttribute("d", `M ${x-25} ${y+15} C ${x - 80} ${y }, ${x-40 } ${y - 80}, ${x-15} ${y - 15}`);
            pesoText.setAttribute("x", x-35);
            pesoText.setAttribute("y", y-10);
        } 
        else {
            loop.setAttribute("d", `M ${x+25} ${y+15} C ${x + 80} ${y }, ${x+30 } ${y - 80}, ${x+15} ${y - 15}`);
            pesoText.setAttribute("x", x+35);
            pesoText.setAttribute("y", y-10);
        }
        loop.setAttribute("stroke", "aqua");
        loop.setAttribute("stroke-width", "1.5");
        loop.setAttribute("fill", "none");
        loop.setAttribute("class", "arco");

        pesoText.setAttribute("class", "peso");
        pesoText.textContent = arc.valor;

        loop.addEventListener("click", () => {
            const weight = prompt("Ingrese peso:", arc.valor);
            arc.valor = parseInt(weight) || 1;
            pesoText.textContent = arc.valor; 
            dibujarNodos();
        });

        svg.appendChild(loop); 
        svg.appendChild(pesoText);
        generarMatriz();       
    } else {

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        const diferenciax = haciaNodo.x - deNodo.x;
        const diferenciay = haciaNodo.y - deNodo.y;
        const distancia = Math.sqrt(diferenciax * diferenciax + diferenciay * diferenciay);

        // Definir un offset fijo para la curvatura del arco
        const offset = Math.max(30, distancia * 0.2); // Asegura que la curva siempre sea visible

        // Calcular el vector perpendicular para desplazar el punto de control
        const perpendicularX = (diferenciay / distancia) * offset;
        const perpendicularY = -(diferenciax / distancia) * offset;

        // Punto de control de la curva
        const controlCurvaX = (deNodo.x + haciaNodo.x) / 2 + perpendicularX;
        const controlCurvaY = (deNodo.y + haciaNodo.y) / 2 + perpendicularY;

        path.setAttribute("d", `M ${deNodo.x} ${deNodo.y} Q ${controlCurvaX} ${controlCurvaY} ${haciaNodo.x} ${haciaNodo.y}`);
        path.setAttribute("class", "arco");
        path.setAttribute("fill", "none");

        // Definir Color
        if (diferenciax > 0) {
            path.setAttribute("stroke", "green");
        } else {
            path.setAttribute("stroke", "red");
        }

        // Texto del peso
        const peso = document.createElementNS("http://www.w3.org/2000/svg", "text");
        peso.setAttribute("x", controlCurvaX);
        peso.setAttribute("y", controlCurvaY);
        peso.setAttribute("class", "peso");
        peso.textContent = arc.valor;

        // Evento para modificar el peso del arco
        path.addEventListener("click", () => {
            const weight = prompt("Ingrese peso:", arc.valor);
            arc.valor = parseInt(weight) || 1;
            peso.textContent = arc.valor;
            dibujarNodos();
        });

        svg.appendChild(path);
        svg.appendChild(peso);
        generarMatriz();
    }
}

// Generar matriz de adyacencia
function generarMatriz() {
    let tamaño = nodos.length;
    let matriz = Array(tamaño + 1).fill().map(() => Array(tamaño + 1).fill("0"));

    matriz[0][0] = " ";
    nodos.forEach((n, i) => {
        matriz[0][i + 1] =  n.nombre;
        matriz[i + 1][0] =  n.nombre;
    });

    arcos.forEach(e => {
        let origen = nodos.findIndex(n => n.id === e.de) + 1;
        let destino = nodos.findIndex(n => n.id === e.hacia) + 1;
        matriz[origen][destino] = e.valor;
    });

    let tabla = document.getElementById("tablaMatriz");
    tabla.innerHTML = "";
    matriz.forEach(fila => {
        let tr = document.createElement("tr");
        fila.forEach(celda => {
            let td = document.createElement(tr.children.length ? "td" : "th");
            td.textContent = celda;
            tr.appendChild(td);
        });
        tabla.appendChild(tr);
    });

    if(nodos.length > 7){
        document.getElementById("tablaMatriz").style="font-size:1vh;padding:1px";
    }
}

// Función para vaciar el SVG
function vaciarCanvas() {
    svg.innerHTML = "";
    nodos = [];
    arcos = [];
    generarMatriz();
}

// Función para guardar el grafo en JSON
function guardarGrafo() {
    let nom = "";
    const nombreArchivo = prompt("Ingrese el nombre que sea para el archivo:", nom);

    if (!nombreArchivo) return;

    const datos={
        nodosJ:nodos,
        arcosJ:arcos
    };
    const jsonString = JSON.stringify(datos, null, 2);

    // Crear un Blob con el JSON
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo+".json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Abrir el explorador de archivos
function abrirArchivo() {
    const archivo = document.getElementById("archivo");
    archivo.click();
    archivo.addEventListener("change", manejarArchivoJSON, { once : true });
}

// Manejar el archivo JSON
function manejarArchivoJSON(event) {
    const file = event.target.files[0]; // Obtener el archivo seleccionado
    if (!file) return;

    const reader = new FileReader(); // Crear lector de archivos

    reader.onload = function (e) {
        try {
            const jsonData = JSON.parse(e.target.result); // Convertir JSON a objeto JS
            nodos = jsonData.nodosJ || [];
            arcos = jsonData.arcosJ || [];
            dibujarNodos();
            generarMatriz();
            alert("Archivo importado correctamente.");
            event.target.value = "";
        } catch (error) {
            alert("Error al leer el archivo JSON.");
            console.error(error);
        }
    };

    reader.readAsText(file); // Leer archivo como texto
}