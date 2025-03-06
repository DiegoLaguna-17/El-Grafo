import Grafo from './Grafo.js';

export default class CPM extends Grafo {
    constructor() {
        super();
    }

    criticalPathMethod() {
        if (this.nodos.length === 0) {
            alert("El grafo está vacío, por favor agregue nodos y arcos.");
            return null;
        }

        for (const arco of this.arcos) {
            if (isNaN(arco.valor) || arco.valor === "?") {
                alert("Todos los arcos deben tener pesos numéricos enteros.");
                return null;
            }
        }

        const { earliestStart, earliestFinish } = this.forwardPass();

        const { latestStart, latestFinish } = this.backwardPass(earliestFinish);

        const slack = this.calculateSlack(earliestStart, latestStart);

        const criticalPath = this.findCriticalPath(slack);

        return {
            earliestStart,
            earliestFinish,
            latestStart,
            latestFinish,
            slack,
            criticalPath,
        };
    }

    forwardPass() {
        const earliestStart = {};
        const earliestFinish = {};

        this.nodos.forEach(nodo => {
            earliestStart[nodo.id] = 0;
            earliestFinish[nodo.id] = 0;
        });

        this.nodos.forEach(nodo => {
            const predecessors = this.arcos
                .filter(arco => arco.hacia === nodo.id)
                .map(arco => arco.de);

            if (predecessors.length > 0) {
                earliestStart[nodo.id] = Math.max(
                    ...predecessors.map(p => earliestFinish[p] + this.getArcWeight(p, nodo.id))
                );
            }

            earliestFinish[nodo.id] = earliestStart[nodo.id] + this.getDuration(nodo.id);
        });

        return { earliestStart, earliestFinish };
    }

    backwardPass(earliestFinish) {
        const latestStart = {};
        const latestFinish = {};

        this.nodos.forEach(nodo => {
            latestStart[nodo.id] = Infinity;
            latestFinish[nodo.id] = Infinity;
        });

        const lastNode = this.nodos[this.nodos.length - 1];
        latestFinish[lastNode.id] = earliestFinish[lastNode.id];
        latestStart[lastNode.id] = latestFinish[lastNode.id] - this.getDuration(lastNode.id);

        for (let i = this.nodos.length - 1; i >= 0; i--) {
            const nodo = this.nodos[i];
            const successors = this.arcos
                .filter(arco => arco.de === nodo.id)
                .map(arco => arco.hacia);

            if (successors.length > 0) {
                latestFinish[nodo.id] = Math.min(
                    ...successors.map(s => latestStart[s] - this.getArcWeight(nodo.id, s))
                );
            }

            latestStart[nodo.id] = latestFinish[nodo.id] - this.getDuration(nodo.id);
        }

        return { latestStart, latestFinish };
    }

    calculateSlack(earliestStart, latestStart) {
        const slack = {};

        this.nodos.forEach(nodo => {
            slack[nodo.id] = latestStart[nodo.id] - earliestStart[nodo.id];
        });

        return slack;
    }

    findCriticalPath(slack) {
        const criticalPath = [];

        this.nodos.forEach(nodo => {
            if (slack[nodo.id] === 0) {
                criticalPath.push(nodo.id);
            }
        });

        return criticalPath;
    }

    getDuration(nodeId) {
        const arco = this.arcos.find(arco => arco.hacia === nodeId);
        return arco ? parseInt(arco.valor) : 0;
    }

    getArcWeight(fromNodeId, toNodeId) {
        const arco = this.arcos.find(arco => arco.de === fromNodeId && arco.hacia === toNodeId);
        return arco ? parseInt(arco.valor) : 0;
    }
}