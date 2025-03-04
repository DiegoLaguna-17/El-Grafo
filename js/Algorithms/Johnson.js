import Grafo from './Grafo.js';

export default class Johnson extends Grafo {
    constructor() {
        super();
    }

    johnsonsAlgorithm() {
        // Restricción 1: Grafo no vacío
        if (this.nodos.length === 0) {
            alert("El grafo está vacío, por favor agregue nodos y arcos.");
            return null;
        }
    
        // Restricción 2: Todos los pesos son numéricos
        for (const arco of this.arcos) {
            if (isNaN(arco.valor) || arco.valor === "?") {
                alert("Todos los arcos deben tener pesos numéricos enteros.");
                return null;
            }
        }
    
        const newNodeId = this.nodos.length + 1;
        this.agregarNodo(0, 0); 
        this.nodos.forEach(nodo => {
            if (nodo.id !== newNodeId) {
                this.agregarArco(newNodeId, nodo.id, 0);
            }
        });
    
        const distances = this.bellmanFord(newNodeId);
    
        // Restricción 3: No ciclos negativos
        if (distances === null) {
            alert("El grafo contiene ciclos negativos, algoritmo de Johnson no es aplicable.");
            this.removerNodo(newNodeId);
            return null;
        }
    
        this.removerNodo(newNodeId);
    
        this.arcos.forEach(arco => {
            const u = arco.de;
            const v = arco.hacia;
            arco.valor = parseInt(arco.valor) + distances[u] - distances[v];
        });
    
        const shortestPaths = [];
        this.nodos.forEach(nodo => {
            shortestPaths.push(this.dijkstra(nodo.id));
        });
    
        this.arcos.forEach(arco => {
            const u = arco.de;
            const v = arco.hacia;
            arco.valor = parseInt(arco.valor) - distances[u] + distances[v];
        });
    
        return shortestPaths;
    }
    
    bellmanFord(startNodeId) {
        const distances = {};
        this.nodos.forEach(nodo => {
            distances[nodo.id] = Infinity;
        });
        distances[startNodeId] = 0;
    
        for (let i = 0; i < this.nodos.length - 1; i++) {
            this.arcos.forEach(arco => {
                const u = arco.de;
                const v = arco.hacia;
                const weight = parseInt(arco.valor);
                if (distances[u] + weight < distances[v]) {
                    distances[v] = distances[u] + weight;
                }
            });
        }
    
        let hasNegativeCycle = false;
        this.arcos.forEach(arco => {
            const u = arco.de;
            const v = arco.hacia;
            const weight = parseInt(arco.valor);
            if (distances[u] + weight < distances[v]) {
                hasNegativeCycle = true;
            }
        });
    
        if (hasNegativeCycle) {
            return null; // Ciclo negativo encontrado
        }
    
        return distances;
    }

    dijkstra(startNodeId) {
        const distances = {};
        const visited = {};
        this.nodos.forEach(nodo => {
            distances[nodo.id] = Infinity;
            visited[nodo.id] = false;
        });
        distances[startNodeId] = 0;

        for (let i = 0; i < this.nodos.length; i++) {
            const u = this.minDistance(distances, visited);
            visited[u] = true;

            this.arcos.forEach(arco => {
                if (arco.de === u) {
                    const v = arco.hacia;
                    const weight = parseInt(arco.valor);
                    if (!visited[v] && distances[u] + weight < distances[v]) {
                        distances[v] = distances[u] + weight;
                    }
                }
            });
        }

        return distances;
    }

    minDistance(distances, visited) {
        let min = Infinity;
        let minNode = null;

        this.nodos.forEach(nodo => {
            if (!visited[nodo.id] && distances[nodo.id] < min) {
                min = distances[nodo.id];
                minNode = nodo.id;
            }
        });

        return minNode;
    }
}