/**
 * 3D Concept Blueprint & Image Gallery Modal with Snapshot Export.
 */
export function initGalleryModal(renderer, scene, camera) {
  const modal = document.getElementById('gallery-modal');
  const openBtn = document.getElementById('btn-open-gallery');
  const closeBtn = document.getElementById('btn-close-gallery');
  const snapshotBtn = document.getElementById('btn-snapshot');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Close when clicking backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // High-res snapshot export
  if (snapshotBtn && renderer && scene && camera) {
    snapshotBtn.addEventListener('click', () => {
      take3DSnapshot(renderer, scene, camera);
    });
  }
}

/**
 * Renders high-resolution frame and triggers PNG download.
 */
export function take3DSnapshot(renderer, scene, camera) {
  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL('image/png');

  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  link.download = `robot-assembly-${timestamp}.png`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  const toastContainer = document.getElementById('toast-container');
  if (toastContainer) {
    const toast = document.createElement('div');
    toast.className = 'hud-toast toast-success';
    toast.textContent = '📸 3D High-Res Snapshot Exported!';
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
}
