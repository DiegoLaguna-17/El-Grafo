document.querySelector(".menu-scroll").addEventListener("scroll", function () {
    let menuItems = document.querySelectorAll(".menu-scroll ul li");
    let menuRect = this.getBoundingClientRect(); // Obtiene el área visible del menú

    menuItems.forEach((item) => {
        let itemRect = item.getBoundingClientRect(); // Posición del elemento
        let distanceFromTop = itemRect.top - menuRect.top; // Distancia desde el inicio visible
        let scale = 1.2 - (distanceFromTop / menuRect.height); // Calcula la escala

        scale = Math.max(scale, 0.8); // el tamaño minimo de las opciones

        item.style.transform = `scale(${scale})`;
        item.style.opacity = scale; // Ajusta la opacidad para el efecto visual
    });
});