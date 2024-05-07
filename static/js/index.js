

document.addEventListener("DOMContentLoaded", function() {
    // ---------------------------------------------MANAGING SIDEBAR--------------------------------------------- // 
    
    screenWidth = window.innerWidth;
 
    // Fuction for the sidebar toggle button
    toggleSidebarButton.addEventListener('click', function toggleSidebar() {
        // Toggle of class 'collapsed' of sidebar
        
        toggleSidebarButton.style.visibility = 'hidden';
        closeSidebarButton.style.visibility = 'visible';
        isSidebarClosed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isSidebarClosed) {
            console.log('sidebar aperta al click del bottone');
            openSidebar();
        } else {
            console.log('sidebar chiusa al click del bottone');
            closeSidebar();
        }
    });

    // Function for the close sidebar button
    closeSidebarButton.addEventListener('click', function closeSidebarBtn() {
        isSidebarClosed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (!isSidebarClosed) {
            console.log('sidebar chiusa al click del bottone');
            closeSidebar();
        }
    });
    
    // Fuction to manage the sidebar state on window resize
    window.addEventListener('resize', function() {

        screenWidth = window.innerWidth;
        isSidebarClosed = localStorage.getItem('sidebarCollapsed') === 'true';
        // console.log(isSidebarCollapsed);
        if (window.innerWidth <= screenLimit) {
            // If the window is smaller than screenLimit
            if (!isSidebarClosed) {
                console.log('sidebar chiusa al ridimensionamento della pagina');
                closeSidebar();
            }
        } else {
            // If the window is larger than screenLimit
            if (isSidebarClosed && toggle) {
                console.log('sidebar aperta al ridimensionamento della pagina');
                // If the sidebar is closed and the user has manually opened it, reopen it and save the state
                openSidebar();
            }
        }
    });

    // ---------------------------------------------END MANAGING SIDEBAR--------------------------------------------- // 
    //-------gestione accessibilita-----//

});


function accessibility() {
    if(localStorage.getItem('accessibility')==null){
        localStorage.setItem('accessibility', true);
        $.ajax({
            type: 'POST',
            url: '/accessibility',
            data: JSON.stringify({acc:true}),
            contentType: 'application/json',
            success: function(data) {
                
            }
        });
    
    }
    if(localStorage.getItem('accessibility') == 'false'){
        localStorage.setItem('accessibility', true);
        $.ajax({
            type: 'POST',
            url: '/accessibility',
            data: JSON.stringify({acc:true}),
            contentType: 'application/json',
            success: function(data) {
                
            }
        });
        
    }
    else{
        localStorage.setItem('accessibility', false);
        $.ajax({
            type: 'POST',
            url: '/accessibility',
            data: JSON.stringify({acc:false}),
            contentType: 'application/json',
            success: function(data) {
                
            }
        });
        
    }   
    console.log(localStorage.getItem('accessibility')); 
}





