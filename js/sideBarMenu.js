document.querySelector(".menu-scroll").addEventListener("scroll", function () {
    let menuItems = document.querySelectorAll(".menu-scroll ul li");
    let menuRect = this.getBoundingClientRect(); 

    menuItems.forEach((item) => {
        let itemRect = item.getBoundingClientRect(); 
        let distanceFromTop = itemRect.top - menuRect.top; 
        let scale = 1.2 - (distanceFromTop / menuRect.height); 

        scale = Math.max(scale, 0.8); 

        item.style.transform = `scale(${scale})`;
        item.style.opacity = scale; 
    });
    
});
