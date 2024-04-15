
document.addEventListener("DOMContentLoaded", function() {

    // ---------------------------------------------MANAGING SIDEBAR--------------------------------------------- // 
    
    const toggleSidebarButton = document.getElementById('sidebar-button');
    const closeSidebarButton = document.getElementById('close-sidebar-button');
    const sidebar = document.getElementById('sidebar');
    toggle = true;
    let sidebarOpen = true;
    let sidebarClosed = false;
    screenWidth = window.innerWidth;
    const screenLimit = 768;
 
    // Fuction for the sidebar toggle button
    toggleSidebarButton.addEventListener('click', function toggleSidebar() {
        // Toggle of class 'collapsed' of sidebar
        if(screenWidth <= screenLimit){
            toggleSidebarButton.style.visibility = 'hidden';
            closeSidebarButton.style.visibility = 'visible';
        }else{
            closeSidebarButton.style.visibility = 'hidden';
        }
        
        if (sidebarOpen) {
            sidebar.classList.toggle('closed');
            sidebarOpen = false;
            sidebarClosed = true;
        } else {
            sidebar.classList.toggle('closed');
            sidebarOpen = true;
            sidebarClosed = false;
        }

        toggle = !toggle;

        //console.log("toggle: " + toggle);

        // Save the state of the sidebar in the local storage
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('closed'));
    });

    // Function for the close sidebar button
    closeSidebarButton.addEventListener('click', function closeSidebar() {
        if(screenWidth <= screenLimit){
            toggleSidebarButton.style.visibility = 'visible';
            closeSidebarButton.style.visibility = 'hidden';
        }
        sidebar.classList.add('closed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('closed'));
    });

    // Function to manage the sidebar state on page load
    window.addEventListener('load', function() {
        if (window.innerWidth <= screenLimit) {
            sidebar.classList.add('closed');
            localStorage.setItem('sidebarCollapsed', 'true');
        }else {
            closeSidebarButton.style.visibility = 'hidden';
        }
    });

    // Fuction to manage the sidebar state on window resize
    window.addEventListener('resize', function() {

        screenWidth = window.innerWidth;
        
        const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        // console.log(isSidebarCollapsed);
        if (window.innerWidth <= screenLimit) {
            // If the window is smaller than screenLimit
            if (!isSidebarCollapsed) {
                // If the sidebar is open, close it and save the state
                closeSidebarButton.style.visibility = 'hidden';
                toggleSidebarButton.style.visibility = 'visible';
                sidebar.classList.add('closed');
                localStorage.setItem('sidebarCollapsed', 'true');
            }
        } else {
            // If the window is larger than screenLimit
            if (isSidebarCollapsed && toggle) {
                // If the sidebar is closed and the user has manually opened it, reopen it and save the state
                toggleSidebarButton.style.visibility = 'visible';
                sidebar.classList.remove('closed');
                localStorage.setItem('sidebarCollapsed', 'false');
            }
        }
    });

    // ---------------------------------------------END MANAGING SIDEBAR--------------------------------------------- // 

});


