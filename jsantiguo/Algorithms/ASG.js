    import Grafo from './Grafo.js';
    export default class ASG extends Grafo {
    constructor() {
        super();
        this.costMatrix = [];
    }

    agregarArco(de, hacia, valor = "?") {
        // Prevent loops (edges where de === hacia)
        if (de === hacia) {
            alert("No se permiten bucles en el algoritmo ASG.");
            return;
        }

        // Prevent multiple edges between the same pair of nodes
        if (this.tieneArco(de, hacia)) {
            alert("Ya existe un arco entre estos nodos. No se puede agregar otro.");
            return;
        }

        super.agregarArco(de, hacia, valor);
    }

    // 🔹 Generar la matriz de costos desde los nodos y arcos
    crearMatrizCostos() {
        const n = this.nodos.length;

        console.log(n);
        if (n === 0) return []; // Si no hay nodos, la matriz es vacía

        // Inicializa la matriz con valores infinitos
        const matriz = Array.from({ length: n }, () => Array(n).fill(0));

        this.arcos.forEach(({ de, hacia, valor }) => {
            if (de <= n && hacia <= n) {  // 🔹 Verificación de límites
                matriz[de - 1][hacia - 1] ={de,hacia, valor}; // Ajuste de índices 1-basados a 0-basados
            } else {
                console.warn(`❌ Error: Arco inválido (${de} → ${hacia})`);
            }
        });

        this.costMatrix = matriz;
        
        return matriz;
    }

    // 🔹 Algoritmo Húngaro (Asignación Óptima)
    // 🔹 Algoritmo Húngaro (Asignación Óptima)
    // 🔹 Algoritmo Húngaro (Asignación Óptima)
    // 🔹 Algoritmo Húngaro (Asignación Óptima)

    // Función principal del Algoritmo Húngaro (base)
    hungarianAlgorithm(matrix, max) {
    const originalMatrix = matrix.slice(1).map(row => row.slice(1).map(Number));
    const n = originalMatrix.length;
    const m = originalMatrix[0].length;

    // Convertir a maximización usando costos invertidos
    const maxVal = Math.max(...originalMatrix.flat());
    const costMatrix = originalMatrix.map(row => row.map(val => maxVal - val));

    // Algoritmo húngaro completo
    const u = new Array(n + 1).fill(0);
    const v = new Array(m + 1).fill(0);
    const p = new Array(m + 1).fill(0);
    const way = new Array(m + 1).fill(0);

    for (let i = 1; i <= n; i++) {
        p[0] = i;
        let minv = new Array(m + 1).fill(Infinity);
        let used = new Array(m + 1).fill(false);
        let j0 = 0;
        
        do {
            used[j0] = true;
            let i0 = p[j0], delta = Infinity, j1;
            
            for (let j = 1; j <= m; j++) {
                if (!used[j]) {
                    const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
                    if (cur < minv[j]) {
                        minv[j] = cur;
                        way[j] = j0;
                    }
                    if (minv[j] < delta) {
                        delta = minv[j];
                        j1 = j;
                    }
                }
            }
            
            for (let j = 0; j <= m; j++) {
                if (used[j]) {
                    u[p[j]] += delta;
                    v[j] -= delta;
                } else {
                    minv[j] -= delta;
                }
            }
            
            j0 = j1;
        } while (p[j0] !== 0);
        
        do {
            const j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
        } while (j0 !== 0);
    }

    // Reconstruir resultados
    const assignments = [];
    const pairs = [];
    let totalCost = 0;

    for (let j = 1; j <= m; j++) {
        if (p[j] !== 0) {
            const rowName = matrix[p[j]][0];
            const colName = matrix[0][j];
            let cost=0;
            if(max===false){
            cost = originalMatrix[p[j] - 1][j - 1]*-1;
            }else{
            cost = originalMatrix[p[j] - 1][j - 1];
            }
            
            // Formato string para assignments
            assignments.push(`<br>${rowName} a ${colName} (Costo: ${cost})`);
            
            // Arreglo de pares para pairs
            pairs.push([rowName, colName]);
            
            totalCost += cost;
        }
    }

    return { 
        assignments, // Formato texto original
        pairs,       // Arreglo de pares solicitado
        totalCost 
    };
    }
    }
