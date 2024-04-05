
document.addEventListener("DOMContentLoaded", function() {

    // ---------------------------------------------MANAGING SIDEBAR--------------------------------------------- // 
    
    const toggleSidebarButton = document.getElementById('sidebar-button');
    const sidebar = document.getElementById('sidebar');
    toggle = true;

    // Fuction for the sidebar toggle button
    toggleSidebarButton.addEventListener('click', function() {
        // Toggle of class 'collapsed' of sidebar
        sidebar.classList.toggle('collapsed');

        toggle = !toggle;

        //console.log("toggle: " + toggle);

        // Save the state of the sidebar in the local storage
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });

    // Function to manage the sidebar state on page load
    window.addEventListener('load', function() {
        const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
        }
    });

    // Fuction to manage the sidebar state on window resize
    window.addEventListener('resize', function() {
        
        const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        // console.log(isSidebarCollapsed);
        if (window.innerWidth <= 1080) {
            // If the window is smaller than 1080px
            if (!isSidebarCollapsed) {
                // If the sidebar is open, close it and save the state
                sidebar.classList.add('collapsed');
                localStorage.setItem('sidebarCollapsed', 'true');
            }
        } else {
            // If the window is larger than 1080px
            if (isSidebarCollapsed && toggle) {
                // If the sidebar is closed and the user has manually opened it, reopen it and save the state
                sidebar.classList.remove('collapsed');
                localStorage.setItem('sidebarCollapsed', 'false');
            }
        }
    });

    // ---------------------------------------------END MANAGING SIDEBAR--------------------------------------------- // 

});
