
document.addEventListener("DOMContentLoaded", function() {
    
    const toggleSidebarButton = document.getElementById('sidebar-button');
    const sidebar = document.getElementById('sidebar');
    toggle = true;

    // Funzione per gestire il click sul bottone
    toggleSidebarButton.addEventListener('click', function() {
        // Toggle della classe 'collapsed' sulla sidebar
        sidebar.classList.toggle('collapsed');

        toggle = !toggle;

        //console.log("toggle: " + toggle);

        // Salva lo stato della sidebar nello storage locale
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });

    // Funzione per ripristinare lo stato della sidebar quando la finestra viene caricata
    window.addEventListener('load', function() {
        const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
        }
    });

    // Funzione per gestire la riduzione della finestra
    window.addEventListener('resize', function() {
        
        const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        // console.log(isSidebarCollapsed);
        if (window.innerWidth <= 1080) {
            // Se la finestra è ridotta a 600px o meno
            if (!isSidebarCollapsed) {
                // Se la sidebar è aperta, chiudila e memorizza lo stato
                sidebar.classList.add('collapsed');
                localStorage.setItem('sidebarCollapsed', 'true');
            }
        } else {
            // Se la finestra è più grande di 600px
            if (isSidebarCollapsed && toggle) {
                // Se la sidebar è chiusa, aprila e memorizza lo stato
                sidebar.classList.remove('collapsed');
                localStorage.setItem('sidebarCollapsed', 'false');
            }
        }
    });

});
