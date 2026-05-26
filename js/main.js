/**
 * Premium Law Firm Website Landing Page
 * Core JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger-toggle');
  const navMenu = document.getElementById('nav-menu');
  const menuLinks = document.querySelectorAll('.menu-link');
  const quoteDialog = document.getElementById('quote-dialog');
  const leadForm = document.getElementById('lead-form');
  const toastSuccess = document.getElementById('toast-success');

  /* ==========================================================================
     1. HAMBURGER MENU (MOBILE NAVIGATION)
     ========================================================================== */
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ==========================================================================
     2. NAVBAR SCROLL EFFECT (BLUR & COMPACT ON SCROLL)
     ========================================================================== */
  const handleNavbarScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll(); // Run initially in case page loads scrolled down

  /* ==========================================================================
     3. SCROLL SPY (ACTIVE LINK ON SCROLL)
     ========================================================================== */
  const sections = document.querySelectorAll('header[id], section[id]');

  const scrollSpy = () => {
    const scrollPosition = window.scrollY + 120; // offset for navbar height

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        menuLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', scrollSpy);

  /* ==========================================================================
     4. MODERN DIALOG & INVOKER COMMANDS FALLBACK
     ========================================================================== */
  const supportsInvokers = 'commandForElement' in HTMLButtonElement.prototype;

  if (!supportsInvokers) {
    console.log('Invoker Commands not natively supported. Implementing manual fallback.');

    document.addEventListener('click', (event) => {
      const button = event.target.closest('button[commandfor]');
      if (!button) return;

      const targetId = button.getAttribute('commandfor');
      const targetElement = document.getElementById(targetId);
      const command = button.getAttribute('command');

      if (targetElement && command) {
        if (targetElement.tagName === 'DIALOG') {
          if (command === 'show-modal') {
            targetElement.showModal();
          } else if (command === 'close') {
            targetElement.close();
          }
        }
      }
    });
  }

  // Backdrop light-dismiss fallback (since Safari and some older browsers don't support closedby="any")
  const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;

  if (!supportsClosedBy && quoteDialog) {
    console.log('Dialog closedby attribute not supported. Implementing click-outside fallback.');
    
    quoteDialog.addEventListener('click', (event) => {
      // If the target clicked is the dialog itself (the backdrop), we dismiss it
      if (event.target !== quoteDialog) return;

      const rect = quoteDialog.getBoundingClientRect();
      const isClickInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isClickInside) {
        quoteDialog.close();
      }
    });
  }

  /* ==========================================================================
     5. LEAD FORM SUBMISSION & TOAST NOTIFICATION
     ========================================================================== */
  if (leadForm && quoteDialog) {
    leadForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent standard page navigation/reload
      
      // Extract form data
      const formData = new FormData(leadForm);
      const clientData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        package: formData.get('package'),
        details: formData.get('details')
      };

      console.log('Lead submission data:', clientData);

      // Simulate sending data to backend/webhook (e.g., Line Notify, Email)
      
      // Close the modal dialog
      quoteDialog.close();

      // Reset the form fields
      leadForm.reset();

      // Show success toast
      showToast();
    });
  }

  const showToast = () => {
    if (toastSuccess) {
      toastSuccess.classList.add('show');

      // Hide toast after 4 seconds
      setTimeout(() => {
        toastSuccess.classList.remove('show');
      }, 4000);
    }
  };

  /* ==========================================================================
     6. CURSOR-BASED LIGHT EFFECT FOR FEATURE CARDS
     ========================================================================== */
  const cards = document.querySelectorAll('.feature-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    });
  });
});
