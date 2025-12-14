// ===== CYBERPUNK FILE SYSTEM SIMULATOR =====

// Mock file system data structure
const fileSystem = {
    name: 'root',
    type: 'folder',
    children: [
        {
            name: 'system',
            type: 'folder',
            children: [
                { name: 'config.sys', type: 'file', content: '[SYSTEM CONFIGURATION]\nVersion: 2.1.4\nStatus: ACTIVE\nSecurity Level: MAXIMUM' },
                { name: 'drivers.dll', type: 'file', content: '[DRIVER MANIFEST]\nGPU: NVIDIA RTX 4090\nCPU: Intel i9-13900K\nRAM: 128GB DDR5' }
            ]
        },
        {
            name: 'data',
            type: 'folder',
            children: [
                { name: 'logs.txt', type: 'file', content: '[SYSTEM LOGS]\n[00:15:23] Boot sequence initiated\n[00:15:45] All systems online\n[00:16:12] Neon interface loaded' },
                { name: 'cache.dat', type: 'file', content: '[CACHE DATA]\nSize: 2.4GB\nFragmentation: 12%\nStatus: OPTIMIZED' }
            ]
        },
        {
            name: 'projects',
            type: 'folder',
            children: [
                { name: 'webapp.js', type: 'file', content: 'function initializeNeonUI() {\n  console.log("FILATO system initialized");\n  applyNeonEffects();\n  startMonitoring();\n}' },
                { name: 'styles.css', type: 'file', content: '/* NEON CYBERPUNK THEME */\n.neon-glow {\n  text-shadow: 0 0 10px #00ff99;\n  box-shadow: 0 0 20px #00d9ff;\n}' }
            ]
        }
    ]
};

let selectedNode = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeFileSystem();
    initializeSystemMonitor();
    initializeTerminal();
    addNeonEffects();
});

// ===== CUSTOM POPUP DIALOGS =====

function showInputDialog(title, placeholder = '', callback) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="custom-modal-content">
            <h3 class="modal-title">${title}</h3>
            <input type="text" class="modal-input" placeholder="${placeholder}" autofocus>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-confirm">Confirm</button>
                <button class="modal-btn modal-btn-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    const input = modal.querySelector('.modal-input');
    const confirmBtn = modal.querySelector('.modal-btn-confirm');
    const cancelBtn = modal.querySelector('.modal-btn-cancel');

    const handleConfirm = () => {
        const value = input.value.trim();
        if (value) {
            callback(value);
            closeModal();
        } else {
            showNotification('⚠ Input cannot be empty', 'error');
        }
    };

    const handleCancel = () => {
        callback(null);
        closeModal();
    };

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleConfirm();
        if (e.key === 'Escape') handleCancel();
    });
}

function showConfirmDialog(message, callback) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="custom-modal-content confirm-modal">
            <p class="modal-message">${message}</p>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-confirm">Delete</button>
                <button class="modal-btn modal-btn-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    const confirmBtn = modal.querySelector('.modal-btn-confirm');
    const cancelBtn = modal.querySelector('.modal-btn-cancel');

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };

    confirmBtn.addEventListener('click', () => {
        callback(true);
        closeModal();
    });

    cancelBtn.addEventListener('click', () => {
        callback(false);
        closeModal();
    });
}

// ===== FILE SYSTEM FUNCTIONS =====

function initializeFileSystem() {
    renderTree(fileSystem, null, 0);
    updateSystemStats();
}

function renderTree(node, parentElement, depth) {
    if (!node) return;

    const treeContainer = document.getElementById('directory-tree');
    if (depth === 0) {
        treeContainer.innerHTML = '';
    }

    const li = document.createElement('li');
    li.className = 'tree-item';
    li.style.paddingLeft = `${depth * 20}px`;
    li.innerHTML = `
        <span class="tree-icon">${node.type === 'folder' ? '📁' : '📄'}</span>
        <span class="tree-name" data-path="${node.name}">${node.name}</span>
    `;

    li.addEventListener('click', (e) => {
        e.stopPropagation();
        selectNode(node, li);
    });

    if (parentElement) {
        parentElement.appendChild(li);
    } else {
        treeContainer.appendChild(li);
    }

    if (node.children && node.type === 'folder') {
        node.children.forEach(child => renderTree(child, treeContainer, depth + 1));
    }
}

function selectNode(node, element) {
    document.querySelectorAll('.tree-item').forEach(item => {
        item.style.background = 'transparent';
        item.style.borderLeftColor = '#00d9ff';
    });

    element.style.background = 'rgba(0, 255, 153, 0.1)';
    element.style.borderLeftColor = '#a3ff00';

    selectedNode = node;
    displayFileContent(node);
}

function displayFileContent(node) {
    const fileContentBox = document.getElementById('file-content');

    if (node.type === 'folder') {
        const childNames = node.children ? node.children.map(c => `  • ${c.name}`).join('\n') : '  [empty folder]';
        fileContentBox.textContent = `[FOLDER: ${node.name}]\n\nContents:\n${childNames}`;
        fileContentBox.style.color = '#a3ff00';
    } else {
        fileContentBox.textContent = node.content || 'No content';
        fileContentBox.style.color = '#00ff99';
    }

    addTypingAnimation(fileContentBox);
}

function addTypingAnimation(element) {
    const text = element.textContent;
    element.textContent = '';
    let index = 0;

    const typeInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
        } else {
            clearInterval(typeInterval);
        }
    }, 15);
}

function createFolder() {
    if (!selectedNode) {
        showNotification('❌ Select a folder first', 'error');
        return;
    }

    if (selectedNode.type !== 'folder') {
        showNotification('❌ Can only create in folders', 'error');
        return;
    }

    showInputDialog('Create New Folder', 'folder name...', (folderName) => {
        if (!folderName) return;

        const newFolder = {
            name: folderName,
            type: 'folder',
            children: []
        };

        if (!selectedNode.children) selectedNode.children = [];
        selectedNode.children.push(newFolder);

        initializeFileSystem();
        showNotification(`✓ Folder "${folderName}" created`, 'success');
    });
}

function createFile() {
    if (!selectedNode) {
        showNotification('❌ Select a folder first', 'error');
        return;
    }

    if (selectedNode.type !== 'folder') {
        showNotification('❌ Can only create in folders', 'error');
        return;
    }

    showInputDialog('Create New File', 'filename with extension...', (fileName) => {
        if (!fileName) return;

        const newFile = {
            name: fileName,
            type: 'file',
            content: '[NEW FILE]\nCreated at: ' + new Date().toLocaleString()
        };

        if (!selectedNode.children) selectedNode.children = [];
        selectedNode.children.push(newFile);

        initializeFileSystem();
        showNotification(`✓ File "${fileName}" created`, 'success');
    });
}

function deleteNode() {
    if (!selectedNode) {
        showNotification('❌ Select a file/folder first', 'error');
        return;
    }

    const nodeName = selectedNode.name;
    showConfirmDialog(`Are you sure you want to delete "${nodeName}"?<br><span style="font-size: 0.85rem; color: #ff006e;">This action cannot be undone.</span>`, (confirmed) => {
        if (confirmed) {
            deleteFromTree(fileSystem, nodeName);
            selectedNode = null;
            document.getElementById('file-content').textContent = 'Select a file...';
            initializeFileSystem();
            showNotification(`✓ "${nodeName}" deleted`, 'success');
        }
    });
}

function renameNode() {
    if (!selectedNode) {
        showNotification('❌ Select a file/folder first', 'error');
        return;
    }

    const currentName = selectedNode.name;
    showInputDialog(`Rename: ${currentName}`, 'new name...', (newName) => {
        if (!newName) return;

        if (newName === currentName) {
            showNotification('⚠ Name is the same', 'error');
            return;
        }

        selectedNode.name = newName;
        initializeFileSystem();
        showNotification(`✓ Renamed to "${newName}"`, 'success');
    });
}

function deleteFromTree(node, targetName) {
    if (node.children) {
        node.children = node.children.filter(child => {
            if (child.name === targetName) return false;
            if (child.type === 'folder') deleteFromTree(child, targetName);
            return true;
        });
    }
}

// ===== SYSTEM MONITOR FUNCTIONS =====

function initializeSystemMonitor() {
    const refreshBtn = document.querySelector('.cyber-container:nth-child(1) .button');

    refreshBtn?.addEventListener('click', () => {
        updateSystemStats();
    });

    updateSystemStats();
    // Update stats every 1 second for dynamic effect
    setInterval(updateSystemStats, 1000);
}

function updateSystemStats() {
    const monitorCard = document.querySelector('.cyber-container:nth-child(1) .card');
    if (!monitorCard) return;

    // Generate dynamic values with slight variation
    const cpu = Math.floor(Math.random() * 85 + 15); // 15-100%
    const memory = Math.floor(Math.random() * 70 + 20); // 20-90%
    const disk = Math.floor(Math.random() * 60 + 25); // 25-85%
    const temp = (Math.random() * 35 + 50).toFixed(1); // 50-85°C

    monitorCard.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">CPU</div>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${cpu}%; background: linear-gradient(90deg, #00ff99, #a3ff00);"></div>
            </div>
            <div class="stat-value">${cpu}%</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">MEMORY</div>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${memory}%; background: linear-gradient(90deg, #00d9ff, #b537f2);"></div>
            </div>
            <div class="stat-value">${memory}%</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">DISK</div>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${disk}%; background: linear-gradient(90deg, #ff006e, #00d9ff);"></div>
            </div>
            <div class="stat-value">${disk}%</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">TEMP</div>
            <div class="stat-value" style="color: ${temp > 70 ? '#ff006e' : '#a3ff00'};">${temp}°C</div>
        </div>
    `;

    monitorCard.style.animation = 'statsUpdate 0.5s ease';
}

// ===== SYSTEM LOG FUNCTIONS =====

const logs = [
    { time: '00:15:23', level: 'INFO', message: 'System boot sequence initiated' },
    { time: '00:15:45', level: 'INFO', message: 'All core systems online' },
    { time: '00:16:12', level: 'INFO', message: 'Neon interface loaded successfully' },
    { time: '00:16:34', level: 'INFO', message: 'Database connection established' },
];

function initializeTerminal() {
    const logsContainer = document.getElementById('logs-container');
    const autoScroll = document.getElementById('auto-scroll');

    // Initial log display
    renderLogs();

    // Add new log entry every 2-5 seconds
    setInterval(() => {
        const logMessages = [
            { level: 'INFO', message: 'Memory cache updated' },
            { level: 'INFO', message: 'Disk buffer flushed' },
            { level: 'INFO', message: 'Network latency: 12ms' },
            { level: 'SUCCESS', message: 'Operation completed successfully' },
            { level: 'WARNING', message: 'CPU temperature rising' },
            { level: 'INFO', message: 'Background process running' },
            { level: 'INFO', message: 'Synchronization in progress' },
            { level: 'INFO', message: 'API response received' },
            { level: 'INFO', message: 'File system scan complete' },
            { level: 'SUCCESS', message: 'Optimization tasks finished' }
        ];

        const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
        const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
        const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        const seconds = String(Math.floor(Math.random() * 60)).padStart(2, '0');

        logs.push({
            time: `${hours}:${minutes}:${seconds}`,
            level: randomLog.level,
            message: randomLog.message
        });

        renderLogs();

        // Auto scroll if enabled
        if (autoScroll.checked) {
            logsContainer.parentElement.scrollTop = logsContainer.parentElement.scrollHeight;
        }
    }, Math.random() * 3000 + 2000);
}

function renderLogs() {
    const logsContainer = document.getElementById('logs-container');
    logsContainer.innerHTML = '';

    logs.forEach((log, index) => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${log.level.toLowerCase()}`;
        logEntry.innerHTML = `
            <span class="log-time">[${log.time}]</span>
            <span class="log-level">${log.level}</span>
            <span class="log-message">${log.message}</span>
        `;
        logsContainer.appendChild(logEntry);
    });
}

function clearLogs() {
    logs.length = 0;
    logs.push({ time: '00:00:00', level: 'INFO', message: 'System logs cleared' });
    renderLogs();
    showNotification('✓ Logs cleared', 'success');
}

// ===== NEON EFFECTS =====

function addNeonEffects() {
    // Add glow to buttons on hover
    document.querySelectorAll('.button').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 25px rgba(0, 255, 153, 0.6), 0 0 40px rgba(0, 217, 255, 0.4)';
        });

        btn.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)';
        });
    });
}

// ===== UTILITY FUNCTIONS =====

function clearLogs() {
    logs.length = 0;
    logs.push({ time: '00:00:00', level: 'INFO', message: 'System logs cleared' });
    renderLogs();
    showNotification('✓ Logs cleared', 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(0, 255, 153, 0.2)' : type === 'error' ? 'rgba(255, 0, 110, 0.2)' : 'rgba(0, 217, 255, 0.2)'};
        border: 2px solid ${type === 'success' ? '#a3ff00' : type === 'error' ? '#ff006e' : '#00d9ff'};
        color: ${type === 'success' ? '#a3ff00' : type === 'error' ? '#ff006e' : '#00d9ff'};
        border-radius: 10px;
        font-family: 'Orbitron', sans-serif;
        z-index: 9999;
        animation: slideIn 0.4s ease;
        box-shadow: 0 0 20px ${type === 'success' ? 'rgba(0, 255, 153, 0.5)' : type === 'error' ? 'rgba(255, 0, 110, 0.5)' : 'rgba(0, 217, 255, 0.5)'};
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ===== CSS ANIMATIONS (injected) =====

const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes statsUpdate {
        0% { opacity: 0.8; }
        100% { opacity: 1; }
    }

    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .stat-item {
        margin: 0.8rem 0;
    }

    .stat-label {
        color: #00d9ff;
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 0.3rem;
        letter-spacing: 1px;
    }

    .stat-bar {
        width: 100%;
        height: 8px;
        background: rgba(0, 217, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid rgba(0, 255, 153, 0.2);
        margin-bottom: 0.3rem;
    }

    .stat-fill {
        height: 100%;
        width: 0%;
        border-radius: 4px;
        box-shadow: 0 0 10px currentColor;
    }

    .stat-value {
        color: #a3ff00;
        font-size: 0.9rem;
        font-weight: 700;
        text-align: right;
    }

    .tree-item {
        padding: 0.5rem 0;
        border-left: 3px solid #00d9ff;
        padding-left: 1rem;
        color: #00d9ff;
        transition: all 0.3s ease;
        cursor: pointer;
        user-select: none;
    }

    .tree-item:hover {
        color: #a3ff00;
        border-left-color: #a3ff00;
        padding-left: 1.3rem;
        text-shadow: 0 0 10px rgba(0, 255, 153, 0.5);
    }

    .tree-icon {
        margin-right: 0.5rem;
    }

    .tree-name {
        font-family: 'Courier New', monospace;
    }

    /* CUSTOM MODAL STYLES */
    .custom-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(5, 5, 26, 0.7);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .custom-modal.active {
        opacity: 1;
    }

    .custom-modal-content {
        background: linear-gradient(135deg, rgba(20, 25, 50, 0.95), rgba(15, 15, 35, 0.95));
        border: 2px solid #00ff99;
        border-radius: 15px;
        padding: 2rem;
        min-width: 350px;
        box-shadow: 
            0 0 40px rgba(0, 255, 153, 0.3),
            0 0 80px rgba(0, 217, 255, 0.2),
            inset 0 0 30px rgba(181, 55, 242, 0.1);
        animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes modalPop {
        0% {
            transform: scale(0.8);
            opacity: 0;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .modal-title {
        color: #a3ff00;
        font-size: 1.4rem;
        margin: 0 0 1rem 0;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        text-shadow: 0 0 10px rgba(0, 255, 153, 0.4);
    }

    .modal-message {
        color: #e0e0ff;
        font-size: 1.05rem;
        margin: 0 0 1.5rem 0;
        line-height: 1.6;
    }

    .modal-input {
        width: 100%;
        padding: 0.8rem 1rem;
        background: linear-gradient(145deg, rgba(10, 10, 25, 0.7), rgba(5, 5, 15, 0.9));
        border: 2px solid #00d9ff;
        color: #00ff99;
        border-radius: 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 1rem;
        margin-bottom: 1.5rem;
        box-sizing: border-box;
        transition: all 0.3s ease;
    }

    .modal-input:focus {
        outline: none;
        border-color: #a3ff00;
        box-shadow: 0 0 20px rgba(0, 255, 153, 0.5), inset 0 0 10px rgba(0, 255, 153, 0.1);
    }

    .modal-input::placeholder {
        color: rgba(0, 255, 153, 0.4);
    }

    .modal-buttons {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

    .modal-btn {
        padding: 0.7rem 1.5rem;
        border: 2px solid;
        border-radius: 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.95rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .modal-btn-confirm {
        background: linear-gradient(135deg, #a3ff00, #00ff99);
        color: #000;
        border-color: #a3ff00;
        box-shadow: 0 0 15px rgba(0, 255, 153, 0.3);
    }

    .modal-btn-confirm:hover {
        box-shadow: 0 0 30px rgba(0, 255, 153, 0.6), 0 0 50px rgba(163, 255, 0, 0.4);
        transform: translateY(-2px);
    }

    .modal-btn-cancel {
        background: linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(255, 0, 110, 0.1));
        color: #ff006e;
        border-color: #ff006e;
        box-shadow: 0 0 15px rgba(255, 0, 110, 0.2);
    }

    .modal-btn-cancel:hover {
        background: linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(255, 0, 110, 0.2));
        box-shadow: 0 0 20px rgba(255, 0, 110, 0.4);
        transform: translateY(-2px);
    }

    .confirm-modal {
        min-width: 380px;
    }

    /* LOG VIEWER STYLES */
    .log-viewer {
        background: linear-gradient(145deg, rgba(10, 10, 25, 0.8), rgba(5, 5, 15, 0.95));
        border: 2px solid var(--neon-blue);
        border-radius: 10px;
        height: 280px;
        overflow-y: auto;
        padding: 1rem;
        margin-bottom: 1.5rem;
        box-shadow: 
            inset 0 0 20px rgba(0, 217, 255, 0.1),
            0 0 20px rgba(0, 217, 255, 0.15);
    }

    .logs-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .log-entry {
        display: flex;
        gap: 1rem;
        padding: 0.6rem 0.8rem;
        border-left: 3px solid;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        background: rgba(0, 0, 0, 0.3);
        animation: logSlideIn 0.3s ease;
    }

    @keyframes logSlideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .log-entry.log-info {
        border-left-color: #00d9ff;
        color: #00d9ff;
    }

    .log-entry.log-success {
        border-left-color: #a3ff00;
        color: #a3ff00;
    }

    .log-entry.log-warning {
        border-left-color: #ffed00;
        color: #ffed00;
    }

    .log-entry.log-error {
        border-left-color: #ff006e;
        color: #ff006e;
    }

    .log-time {
        font-weight: 700;
        opacity: 0.7;
        min-width: 75px;
    }

    .log-level {
        font-weight: 700;
        min-width: 70px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .log-message {
        flex: 1;
        opacity: 0.9;
    }

    .log-controls {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 0.5rem;
    }

    .log-controls .button {
        flex: 0;
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
    }

    .log-controls .label {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: var(--neon-cyan);
    }

    .log-controls input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: var(--neon-cyan);
    }
`;

document.head.appendChild(styleSheet);
