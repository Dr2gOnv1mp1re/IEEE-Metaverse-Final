import { ROBOT_PARTS_CATALOG } from './robotParts.js';
import { loadRobotPreset } from './robotPresets.js';

export class UIController {
  constructor({ dragDropSystem, robotSimulator, tutorialSystem, environment }) {
    this.dragDropSystem = dragDropSystem;
    this.robotSimulator = robotSimulator;
    this.tutorialSystem = tutorialSystem;
    this.environment = environment;
    
    this.currentMode = 'build';
    this.activeCategory = 'all';
    this.searchFilter = '';

    // Cache DOM elements
    this.partsContainer = document.getElementById('parts-grid-container');
    this.categoryTabs = document.getElementById('category-tabs');
    this.searchInput = document.getElementById('part-search-input');
    
    this.btnModeBuild = document.getElementById('btn-mode-build');
    this.btnModeSim = document.getElementById('btn-mode-sim');
    this.btnModeTut = document.getElementById('btn-mode-tut');
    
    this.buildInspector = document.getElementById('build-inspector-content');
    this.simInspector = document.getElementById('sim-inspector-content');
    this.tutorialInspector = document.getElementById('tutorial-inspector-content');
    this.simDriveTip = document.getElementById('sim-drive-tip');

    this.selEmptyHint = document.getElementById('selected-part-empty');
    this.selDetails = document.getElementById('selected-part-details');
    this.selPartName = document.getElementById('sel-part-name');
    this.selPartCat = document.getElementById('sel-part-category');
    this.selSocketsList = document.getElementById('sel-sockets-list');

    this.presetSelect = document.getElementById('preset-select');
    this.themeSelect = document.getElementById('theme-select');
    this.focusBtn = document.getElementById('btn-focus-workspace');

    this.init();
  }

  init() {
    this.initPartsCatalog();
    this.initModeSwitcher();
    this.initSelectedPartControls();
    this.initTopNavControls();
    
    // Initial render
    this.renderPartsCatalog();
  }

  initPartsCatalog() {
    if (this.categoryTabs) {
      this.categoryTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.cat-pill');
        if (!btn) return;
        this.categoryTabs.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.cat;
        this.renderPartsCatalog();
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchFilter = e.target.value.toLowerCase().trim();
        this.renderPartsCatalog();
      });
    }
  }

  renderPartsCatalog() {
    if (!this.partsContainer) return;
    this.partsContainer.innerHTML = '';

    const parts = Object.values(ROBOT_PARTS_CATALOG);
    let count = 0;

    parts.forEach(part => {
      if (this.activeCategory !== 'all' && part.category !== this.activeCategory) return;
      if (this.searchFilter && !part.name.toLowerCase().includes(this.searchFilter) && !part.description.toLowerCase().includes(this.searchFilter)) {
        return;
      }

      count++;
      const card = document.createElement('div');
      card.className = 'part-card';
      card.setAttribute('draggable', 'true');
      card.dataset.partId = part.id;

      const catColors = {
        bases: '#38bdf8', joints: '#f59e0b', limbs: '#a855f7',
        tools: '#22c55e', sensors: '#ec4899', power: '#06b6d4'
      };
      const catColor = catColors[part.category] || '#94a3b8';

      card.innerHTML = `
        <div class="part-card-top">
          <span class="part-card-name">
            <span class="part-drag-handle">⠿</span>
            ${part.name}
          </span>
          <span class="part-category-tag" style="color: ${catColor}; border: 1px solid ${catColor}44;">
            ${part.category}
          </span>
        </div>
        <p class="part-desc">${part.description}</p>
        <div class="part-card-bottom">
          <div class="part-specs">
            <span>${part.mass}kg</span>
            <span>${part.power >= 0 ? part.power + 'W' : '+' + Math.abs(part.power) + 'W'}</span>
            <span>${part.dof} DOF</span>
          </div>
          <button type="button" class="part-add-btn" data-add-part="${part.id}" title="Click to auto-snap or add to table">
            + Add
          </button>
        </div>
      `;

      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', part.id);
        this.dragDropSystem.startDrag(part.id);
      });

      card.addEventListener('dragend', () => {
        this.dragDropSystem.cancelDrag();
      });

      const addBtn = card.querySelector('[data-add-part]');
      if (addBtn) {
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dragDropSystem.spawnPartDirectly(part.id);
        });
      }

      this.partsContainer.appendChild(card);
    });

    const countBadge = document.getElementById('catalog-count-badge');
    if (countBadge) countBadge.textContent = `${count} Modules`;
  }

  initModeSwitcher() {
    this.btnModeBuild?.addEventListener('click', () => this.setAppMode('build'));
    this.btnModeSim?.addEventListener('click', () => this.setAppMode('sim'));
    this.btnModeTut?.addEventListener('click', () => this.setAppMode('tutorial'));
  }

  setAppMode(mode) {
    this.currentMode = mode;

    this.btnModeBuild?.classList.remove('active');
    this.btnModeSim?.classList.remove('active');
    this.btnModeTut?.classList.remove('active');

    this.buildInspector?.classList.remove('active');
    this.simInspector?.classList.remove('active');
    this.tutorialInspector?.classList.remove('active');
    this.simDriveTip?.classList.add('hidden');

    if (mode === 'build') {
      this.btnModeBuild?.classList.add('active');
      this.buildInspector?.classList.add('active');
      this.robotSimulator.stopSimulation();
      this.tutorialSystem.beaconGroup.visible = false;
      this.dragDropSystem.showToast('Switched to BUILD MODE: Drag & drop parts to customize', 'info');
    } else if (mode === 'sim') {
      this.btnModeSim?.classList.add('active');
      this.simInspector?.classList.add('active');
      this.tutorialSystem.beaconGroup.visible = false;
      this.robotSimulator.startSimulation();
      if (this.robotSimulator.mobileBases.length > 0) {
        this.simDriveTip?.classList.remove('hidden');
      }
      this.dragDropSystem.showToast('Switched to SIMULATION MODE: Test joints, tools & drive rover', 'success');
    } else if (mode === 'tutorial') {
      this.btnModeTut?.classList.add('active');
      this.tutorialInspector?.classList.add('active');
      this.robotSimulator.stopSimulation();
      this.tutorialSystem.loadModule(this.tutorialSystem.currentModule.id);
      this.dragDropSystem.showToast('Switched to TUTORIAL MODE: Follow guided robotics assembly lessons', 'info');
    }
  }

  initSelectedPartControls() {
    document.getElementById('btn-rot-x')?.addEventListener('click', () => this.dragDropSystem.rotateSelected('x', Math.PI / 2));
    document.getElementById('btn-rot-y')?.addEventListener('click', () => this.dragDropSystem.rotateSelected('y', Math.PI / 2));
    document.getElementById('btn-rot-z')?.addEventListener('click', () => this.dragDropSystem.rotateSelected('z', Math.PI / 2));
    document.getElementById('btn-delete-part')?.addEventListener('click', () => this.dragDropSystem.deleteSelected());
  }

  initTopNavControls() {
    if (this.presetSelect) {
      this.presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          loadRobotPreset(val, this.dragDropSystem);
          if (this.currentMode === 'sim') {
            this.robotSimulator.startSimulation();
          }
        }
      });
    }

    if (this.themeSelect) {
      this.themeSelect.addEventListener('change', (e) => {
        this.dragDropSystem.applyTheme(e.target.value);
      });
    }

    if (this.focusBtn && this.environment.focusAssemblyWorkspace) {
      this.focusBtn.addEventListener('click', () => {
        this.environment.focusAssemblyWorkspace();
      });
    }
  }

  updateSelectedPartUI(selectionInfo) {
    if (!selectionInfo || !selectionInfo.part) {
      this.selEmptyHint?.classList.remove('hidden');
      this.selDetails?.classList.add('hidden');
      return;
    }

    const { part, meta } = selectionInfo;
    this.selEmptyHint?.classList.add('hidden');
    this.selDetails?.classList.remove('hidden');

    if (this.selPartName) this.selPartName.textContent = meta?.name || part.userData.name;
    if (this.selPartCat) this.selPartCat.textContent = `Category: ${meta?.category || part.userData.category}`;

    if (this.selSocketsList) {
      this.selSocketsList.innerHTML = '';
      const sockets = part.userData.snapSockets || [];
      if (sockets.length === 0) {
        this.selSocketsList.innerHTML = `<span style="font-size: 0.68rem; color: var(--text-muted);">No outgoing sockets (terminal module).</span>`;
      } else {
        sockets.forEach(s => {
          const row = document.createElement('div');
          row.className = 'socket-pill-row';
          const isOccupied = Boolean(s.occupiedBy);
          row.innerHTML = `
            <span>${s.name}</span>
            <span class="socket-status-badge ${isOccupied ? 'connected' : 'open'}">
              ${isOccupied ? 'CONNECTED' : 'OPEN'}
            </span>
          `;
          this.selSocketsList.appendChild(row);
        });
      }
    }
  }

  updateDiagnosticsHUD(summary) {
    if (!summary) return;
    const massEl = document.getElementById('stat-mass');
    const powerEl = document.getElementById('stat-power');
    const dofEl = document.getElementById('stat-dof');
    const partsEl = document.getElementById('stat-parts');

    if (massEl) massEl.textContent = `${summary.totalMass} kg`;
    if (powerEl) powerEl.textContent = `${summary.totalPower} W`;
    if (dofEl) dofEl.textContent = `${summary.totalDof} DOF`;
    if (partsEl) partsEl.textContent = `${summary.partsCount}`;

    if (this.currentMode === 'sim') {
      this.robotSimulator.scanRobotHardware();
      this.robotSimulator.buildSimControlsUI();
    }

    if (this.currentMode === 'tutorial') {
      this.tutorialSystem.updateTargetBeacon();
    }
  }
}
