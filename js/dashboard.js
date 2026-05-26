/**
 * Premium Law Backend Dashboard Demo
 * Interactive Controls & Theme Switcher
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Tabs
  const menuItems = document.querySelectorAll('.menu-item');
  const panels = document.querySelectorAll('.tab-panel');
  const pageTitle = document.getElementById('page-title');
  
  // Mobile Sidebar Toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const wrapper = document.querySelector('.dashboard-wrapper');
  
  // Stats Counters
  const countClients = document.getElementById('count-clients');
  const countCases = document.getElementById('count-cases');
  let clientCounter = 142;
  let caseCounter = 38;
  
  // Client Table & Dialog
  const clientsTableBody = document.querySelector('#clients-table tbody');
  const addClientDialog = document.getElementById('add-client-dialog');
  const addClientForm = document.getElementById('add-client-form');
  
  // Toast Alert
  const toast = document.getElementById('toast-success');
  const toastMessage = document.getElementById('toast-message');

  // Case Tracker Selector & Timeline
  const caseSelectItems = document.querySelectorAll('.case-select-item');
  const caseDetailClient = document.getElementById('case-detail-client');
  const caseDetailType = document.getElementById('case-detail-type');
  const timelineSteps = document.querySelectorAll('#timeline-steps .step-item');
  const simStepBtns = document.querySelectorAll('.btn-sim-step');
  
  // Theme Switcher Buttons
  const themeSelectors = document.querySelectorAll('.btn-theme-selector');

  /* ==========================================================================
     1. TAB PANEL NAVIGATION
     ========================================================================== */
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all menu items
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');
      
      const tabName = item.getAttribute('data-tab');
      
      // Hide all panels, show target panel
      panels.forEach(panel => panel.classList.remove('active'));
      const targetPanel = document.getElementById(`panel-${tabName}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
      
      // Update page title
      const titleMap = {
        'overview': 'ภาพรวมระบบ (Overview)',
        'clients': 'จัดการรายชื่อลูกค้า (Clients)',
        'cases': 'ติดตามสถานะคดี (Case Tracker)',
        'settings': 'ทดลองเปลี่ยนธีมสี (Dashboard Theme)'
      };
      pageTitle.textContent = titleMap[tabName] || 'ระบบหลังบ้าน';
      
      // Close sidebar on mobile
      closeMobileSidebar();
    });
  });

  /* ==========================================================================
     2. MOBILE SIDEBAR TOGGLE
     ========================================================================== */
  if (sidebarToggle && sidebar && wrapper) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      wrapper.classList.toggle('sidebar-open');
    });

    // Close sidebar clicking outside on mobile backdrop
    document.addEventListener('click', (e) => {
      if (wrapper.classList.contains('sidebar-open') && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        closeMobileSidebar();
      }
    });
  }

  const closeMobileSidebar = () => {
    if (sidebar && wrapper) {
      sidebar.classList.remove('open');
      wrapper.classList.remove('sidebar-open');
    }
  };

  /* ==========================================================================
     3. THEME SWITCHER (REAL-TIME PREVIEW & QUERY PARAMS)
     ========================================================================== */
  const themes = ['theme-dark-gold', 'theme-light-blue', 'theme-warm-cream'];

  const switchTheme = (targetTheme) => {
    // Remove all theme classes from body
    themes.forEach(theme => document.body.classList.remove(theme));
    // Add target theme class
    document.body.classList.add(targetTheme);

    // Update active state on selectors
    themeSelectors.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-theme') === targetTheme) {
        btn.classList.add('active');
      }
    });

    console.log(`Theme switched to: ${targetTheme}`);
  };

  // Add click listener to theme buttons
  themeSelectors.forEach(selector => {
    selector.addEventListener('click', () => {
      const selectedTheme = selector.getAttribute('data-theme');
      switchTheme(selectedTheme);
      showToastNotification('สลับธีมแดชบอร์ดเสร็จเรียบร้อย!');
    });
  });

  // Check URL parameters for theme override
  const applyThemeFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    
    if (themeParam === 'light') {
      switchTheme('theme-light-blue');
    } else if (themeParam === 'cream') {
      switchTheme('theme-warm-cream');
    } else {
      switchTheme('theme-dark-gold');
    }
  };

  applyThemeFromUrl();

  /* ==========================================================================
     4. ADD NEW CLIENT (DYNAMIC DATA APPEND)
     ========================================================================== */
  if (addClientForm && addClientDialog) {
    addClientForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(addClientForm);
      const name = formData.get('name');
      const phone = formData.get('phone');
      const type = formData.get('type');
      
      // Generate ID
      clientCounter++;
      caseCounter++;
      const clientId = `C-0${clientCounter - 4}`; // Align with base counter
      
      // Create new table row
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${clientId}</td>
        <td>${name}</td>
        <td>${type}</td>
        <td>${phone}</td>
        <td><span class="status-badge status-active">คดีดำเนินอยู่</span></td>
        <td><button class="btn-table-action view-case-btn" data-case-id="${clientCounter - 4}">ส่องสถานะคดี</button></td>
      `;
      
      // Prepend to top of table body
      if (clientsTableBody) {
        clientsTableBody.insertBefore(newRow, clientsTableBody.firstChild);
      }
      
      // Update counters in UI
      if (countClients) countClients.textContent = `${clientCounter} คน`;
      if (countCases) countCases.textContent = `${caseCounter} คดี`;
      
      // Close modal & reset form
      addClientDialog.close();
      addClientForm.reset();
      
      // Add dynamically created button listener
      const viewBtn = newRow.querySelector('.view-case-btn');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          triggerCaseView(viewBtn.getAttribute('data-case-id'), name, type);
        });
      }
      
      // Add new case selector item dynamically to tracker list
      addNewCaseSelectorItem(clientCounter - 4, name, type);

      showToastNotification(`บันทึกข้อมูลคุณ ${name} สำเร็จและอัปเดตสถานะหลังบ้านแล้ว!`);
    });
  }

  const addNewCaseSelectorItem = (caseId, clientName, caseType) => {
    const selectorContainer = document.querySelector('.case-list-selector');
    if (selectorContainer) {
      const newCaseBtn = document.createElement('button');
      newCaseBtn.className = 'case-select-item';
      newCaseBtn.setAttribute('data-case', caseId);
      newCaseBtn.setAttribute('data-client', clientName);
      newCaseBtn.setAttribute('data-type', `${caseType} (คดีใหม่)`);
      newCaseBtn.innerHTML = `
        <span class="case-number">คดีเลขที่ C-0${caseId}</span>
        <h4>${clientName}</h4>
        <small>สถานะปัจจุบัน: ยื่นคำร้องขอฟ้องร้อง</small>
      `;

      selectorContainer.insertBefore(newCaseBtn, selectorContainer.firstChild);

      // Add click event for the new list selector item
      newCaseBtn.addEventListener('click', () => {
        handleCaseSelectorClick(newCaseBtn);
      });
    }
  };

  /* ==========================================================================
     5. CASE TRACKER & DYNAMIC TIMELINE UPDATER
     ========================================================================== */
  // Define default steps mapping for each dummy case
  const caseStepsMapping = {
    '101': 3, // Criminal case - Step 3 (active)
    '102': 2, // Civil case - Step 2 (active)
    '103': 4, // Land case - Step 4 (active/completed)
    '104': 1  // Family case - Step 1 (active)
  };

  let activeCaseId = '101'; // Default active case

  const updateTimelineUI = (activeStepNumber) => {
    timelineSteps.forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'));
      step.classList.remove('completed', 'active');

      if (stepNum < activeStepNumber) {
        step.classList.add('completed');
        step.querySelector('.step-icon').textContent = '✔';
      } else if (stepNum === activeStepNumber) {
        step.classList.add('active');
        step.querySelector('.step-icon').textContent = activeStepNumber;
      } else {
        step.querySelector('.step-icon').textContent = stepNum;
      }
    });

    // Update steps mapping data memory
    caseStepsMapping[activeCaseId] = activeStepNumber;
    
    // Update active label in sidebar selection
    const activeSidebarBtn = document.querySelector(`.case-select-item[data-case="${activeCaseId}"]`);
    if (activeSidebarBtn) {
      const stepLabels = {
        1: 'สถานะปัจจุบัน: ยื่นคำร้องขอฟ้องร้อง',
        2: 'สถานะปัจจุบัน: ไกล่เกลี่ยพยาน',
        3: 'สถานะปัจจุบัน: กำลังสืบพยาน',
        4: 'สถานะปัจจุบัน: ศาลมีคำพิพากษา'
      };
      activeSidebarBtn.querySelector('small').textContent = stepLabels[activeStepNumber] || 'กำลังอัปเดต';
    }
  };

  const handleCaseSelectorClick = (btn) => {
    document.querySelectorAll('.case-select-item').forEach(item => item.classList.remove('active'));
    btn.classList.add('active');

    activeCaseId = btn.getAttribute('data-case');
    const clientName = btn.getAttribute('data-client');
    const caseType = btn.getAttribute('data-type');

    caseDetailClient.textContent = clientName;
    caseDetailType.textContent = caseType;

    // Get current progress or set default to 1
    const currentStep = caseStepsMapping[activeCaseId] || 1;
    updateTimelineUI(currentStep);
  };

  // Add click listeners to case selection buttons
  caseSelectItems.forEach(btn => {
    btn.addEventListener('click', () => {
      handleCaseSelectorClick(btn);
    });
  });

  // Connect table action buttons to tracker tab and view case details
  document.querySelectorAll('.view-case-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      const clientName = row.cells[1].textContent;
      const caseType = row.cells[2].textContent;
      const caseId = btn.getAttribute('data-case-id');
      triggerCaseView(caseId, clientName, caseType);
    });
  });

  const triggerCaseView = (caseId, clientName, caseType) => {
    // Jump to Case Tracker Tab
    const trackerMenuItem = document.querySelector('.menu-item[data-tab="cases"]');
    if (trackerMenuItem) {
      trackerMenuItem.click();
    }

    // Force selection of this case in tracker list
    let caseBtn = document.querySelector(`.case-select-item[data-case="${caseId}"]`);
    if (caseBtn) {
      handleCaseSelectorClick(caseBtn);
    } else {
      // If it doesn't exist, create it then click it
      addNewCaseSelectorItem(caseId, clientName, caseType);
      caseBtn = document.querySelector(`.case-select-item[data-case="${caseId}"]`);
      if (caseBtn) handleCaseSelectorClick(caseBtn);
    }
  };

  // Connect Simulator Buttons to dynamically modify timeline steps
  simStepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stepNum = parseInt(btn.getAttribute('data-target-step'));
      updateTimelineUI(stepNum);
      showToastNotification(`อัปเดตสเต็ปไทม์ไลน์เป็นขั้นตอนที่ ${stepNum} เรียบร้อย!`);
    });
  });

  /* ==========================================================================
     6. DIALOG INVOKER & LIGHT-DISMISS FALLBACKS
     ========================================================================== */
  const supportsDialogInvokers = 'commandForElement' in HTMLButtonElement.prototype;

  if (!supportsDialogInvokers) {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button[commandfor]');
      if (!button) return;

      const targetId = button.getAttribute('commandfor');
      const targetElement = document.getElementById(targetId);
      const command = button.getAttribute('command');

      if (targetElement && command && targetElement.tagName === 'DIALOG') {
        if (command === 'show-modal') {
          targetElement.showModal();
        } else if (command === 'close') {
          targetElement.close();
        }
      }
    });
  }

  // Dialog Backdrop Click Light Dismiss Fallback
  const supportsClosedByAttr = 'closedBy' in HTMLDialogElement.prototype;

  if (!supportsClosedByAttr && addClientDialog) {
    addClientDialog.addEventListener('click', (e) => {
      if (e.target !== addClientDialog) return;
      const rect = addClientDialog.getBoundingClientRect();
      const isInside = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInside) {
        addClientDialog.close();
      }
    });
  }

  /* ==========================================================================
     7. TOAST NOTIFICATION CONTROLLER
     ========================================================================== */
  const showToastNotification = (msg) => {
    if (toast && toastMessage) {
      toastMessage.textContent = msg;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }
  };
});
