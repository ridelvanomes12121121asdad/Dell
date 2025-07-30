// Dados dos livros
const books = [
    {
        id: 1,
        title: "Alemão",
        filename: "Alemão.pdf",
        language: "Alemão",
        size: "15MB",
        icon: "fas fa-flag",
        cover: "img/Alemão.png"
    },
    {
        id: 2,
        title: "Chinês",
        filename: "chines.pdf",
        language: "Chinês",
        size: "80MB",
        icon: "fas fa-dragon",
        cover: "img/China.png"
    },
    {
        id: 3,
        title: "Espanhol",
        filename: "Espanhol.pdf",
        language: "Espanhol",
        size: "1.5MB",
        icon: "fas fa-sun",
        cover: "img/Espanha.png"
    },
    {
        id: 4,
        title: "Estados Unidos",
        filename: "Estados unidos.pdf",
        language: "Inglês",
        size: "6.2MB",
        icon: "fas fa-star",
        cover: "img/Estados unidos.png"
    },
    {
        id: 5,
        title: "França",
        filename: "Franca.pdf",
        language: "Francês",
        size: "2.0MB",
        icon: "fas fa-eiffel-tower",
        cover: "img/França.png"
    },
    {
        id: 6,
        title: "Itália",
        filename: "italia.pdf",
        language: "Italiano",
        size: "2.0MB",
        icon: "fas fa-pizza-slice",
        cover: "img/Italia.png"
    },
    {
        id: 7,
        title: "Portugal",
        filename: "Portugal.pdf",
        language: "Português",
        size: "6.8MB",
        icon: "fas fa-anchor",
        cover: "img/Portugal.png"
    },
    {
        id: 8,
        title: "Russo",
        filename: "Russo.pdf",
        language: "Russo",
        size: "12MB",
        icon: "fas fa-snowflake",
        cover: "img/Russo.png"
    }
];

// Elementos DOM
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('pdfModal');
const modalTitle = document.getElementById('modalTitle');
const pdfViewer = document.getElementById('pdfViewer');
const closeModal = document.getElementById('closeModal');
const loading = document.getElementById('loading');

// Estado da aplicação
let readingSessions = {};
let currentSession = null;
let sessionStartTime = null;
let isFullscreen = false;

// Cores para os gradientes dos livros (tema dark)
const bookColors = [
    'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
    'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    'linear-gradient(135deg, #2c5282 0%, #2b6cb0 100%)',
    'linear-gradient(135deg, #2f855a 0%, #38a169 100%)',
    'linear-gradient(135deg, #c53030 0%, #e53e3e 100%)',
    'linear-gradient(135deg, #d69e2e 0%, #f6ad55 100%)',
    'linear-gradient(135deg, #805ad5 0%, #9f7aea 100%)',
    'linear-gradient(135deg, #dd6b20 0%, #ed8936 100%)'
];

// Função para carregar dados do localStorage
function loadReadingData() {
    const savedData = localStorage.getItem('readingData');
    if (savedData) {
        const data = JSON.parse(savedData);
        readingSessions = data.sessions || {};
        updateReadingStats();
    }
}

// Função para salvar dados no localStorage
function saveReadingData() {
    const data = {
        sessions: readingSessions,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('readingData', JSON.stringify(data));
}

// Função para formatar tempo de leitura
function formatReadingTime(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    }
}

// Função para obter tempo de leitura de um livro
function getBookReadingTime(bookId) {
    const sessions = readingSessions[bookId] || [];
    const totalMinutes = sessions.reduce((total, session) => {
        return total + (session.duration || 0);
    }, 0);
    return totalMinutes;
}

// Função para verificar se livro foi lido
function isBookRead(bookId) {
    const sessions = readingSessions[bookId] || [];
    return sessions.some(session => session.completed);
}

// Função para iniciar sessão de leitura
function startReadingSession(bookId) {
    currentSession = {
        bookId: bookId,
        startTime: new Date(),
        duration: 0
    };
    sessionStartTime = Date.now();
    
    // Atualizar interface
    updateReadingStats();
}

// Função para finalizar sessão de leitura
function endReadingSession() {
    if (currentSession && sessionStartTime) {
        const duration = Math.floor((Date.now() - sessionStartTime) / 60000); // em minutos
        
        if (!readingSessions[currentSession.bookId]) {
            readingSessions[currentSession.bookId] = [];
        }
        
        readingSessions[currentSession.bookId].push({
            startTime: currentSession.startTime.toISOString(),
            duration: duration,
            completed: false
        });
        
        saveReadingData();
        currentSession = null;
        sessionStartTime = null;
        
        // Atualizar interface
        updateReadingStats();
        displayBooks();
    }
}

// Função para marcar livro como lido
function markBookAsRead(bookId) {
    if (!readingSessions[bookId]) {
        readingSessions[bookId] = [];
    }
    
    // Marcar última sessão como completa ou criar nova
    if (readingSessions[bookId].length > 0) {
        readingSessions[bookId][readingSessions[bookId].length - 1].completed = true;
    } else {
        readingSessions[bookId].push({
            startTime: new Date().toISOString(),
            duration: 0,
            completed: true
        });
    }
    
    saveReadingData();
    displayBooks();
    updateReadingStats();
}

// Função para atualizar estatísticas
function updateReadingStats() {
    const statsContainer = document.querySelector('.reading-stats');
    if (!statsContainer) return;
    
    const totalBooks = books.length;
    const readBooks = books.filter(book => isBookRead(book.id)).length;
    const totalTime = Object.values(readingSessions).flat().reduce((total, session) => {
        return total + (session.duration || 0);
    }, 0);
    
    statsContainer.innerHTML = `
        <div class="stats-title">
            <i class="fas fa-chart-line"></i>
            Estatísticas de Leitura
        </div>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${readBooks}</div>
                <div class="stat-label">Livros Lidos</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalBooks}</div>
                <div class="stat-label">Total de Livros</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${formatReadingTime(totalTime)}</div>
                <div class="stat-label">Tempo Total</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${Math.round((readBooks / totalBooks) * 100)}%</div>
                <div class="stat-label">Progresso</div>
            </div>
        </div>
    `;
}

// Função para alternar tela cheia
function toggleFullscreen() {
    const modalContent = document.querySelector('.modal-content');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!isFullscreen) {
        // Entrar em tela cheia
        if (modalContent.requestFullscreen) {
            modalContent.requestFullscreen();
        } else if (modalContent.webkitRequestFullscreen) {
            modalContent.webkitRequestFullscreen();
        } else if (modalContent.msRequestFullscreen) {
            modalContent.msRequestFullscreen();
        }
        
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        fullscreenBtn.title = 'Sair da Tela Cheia';
        isFullscreen = true;
    } else {
        // Sair da tela cheia
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.title = 'Tela Cheia';
        isFullscreen = false;
    }
}

// Função para criar card do livro
function createBookCard(book, index) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const colorIndex = index % bookColors.length;
    const readingTime = getBookReadingTime(book.id);
    const isRead = isBookRead(book.id);
    
    card.innerHTML = `
        <div class="book-cover" style="background: ${bookColors[colorIndex]}">
            <img src="${book.cover}" alt="Capa do ${book.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <i class="${book.icon}" style="display: none;"></i>
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <span class="book-language">${book.language}</span>
            <div class="book-size">
                <i class="fas fa-file-pdf"></i>
                ${book.size}
            </div>
            ${readingTime > 0 ? `<div class="reading-time">
                <i class="fas fa-clock"></i>
                ${formatReadingTime(readingTime)} de leitura
            </div>` : ''}
            <button class="read-button ${isRead ? 'read' : ''}" onclick="event.stopPropagation(); markBookAsRead(${book.id})">
                ${isRead ? '✓ Já Li' : 'Marcar como Lido'}
            </button>
        </div>
    `;
    
    // Adicionar evento de clique
    card.addEventListener('click', () => openBook(book));
    
    return card;
}

// Função para abrir livro no modal
function openBook(book) {
    const pdfPath = `livros/${book.filename}`;
    
    modalTitle.textContent = book.title;
    pdfViewer.src = pdfPath;
    modal.style.display = 'block';
    
    // Adicionar botão de tela cheia
    const modalHeader = document.querySelector('.modal-header');
    if (!document.getElementById('fullscreenBtn')) {
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.id = 'fullscreenBtn';
        fullscreenBtn.className = 'fullscreen-btn';
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.title = 'Tela Cheia';
        fullscreenBtn.onclick = toggleFullscreen;
        
        // Inserir antes do botão de fechar
        const closeBtn = document.querySelector('.close-btn');
        modalHeader.insertBefore(fullscreenBtn, closeBtn);
    }
    
    // Iniciar sessão de leitura
    startReadingSession(book.id);
    
    // Adicionar classe para animação
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
    
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
}

// Função para fechar modal
function closeBookModal() {
    // Finalizar sessão de leitura
    endReadingSession();
    
    // Sair da tela cheia se estiver ativa
    if (isFullscreen) {
        toggleFullscreen();
    }
    
    modal.style.display = 'none';
    pdfViewer.src = '';
    document.body.style.overflow = 'auto';
}

// Função para filtrar livros
function filterBooks(searchTerm) {
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.language.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    displayBooks(filteredBooks);
}

// Função para exibir livros
function displayBooks(booksToShow = books) {
    booksGrid.innerHTML = '';
    
    if (booksToShow.length === 0) {
        booksGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: #e8e8e8; padding: 40px;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.7;"></i>
                <h3>Nenhum livro encontrado</h3>
                <p>Tente buscar por outro termo</p>
            </div>
        `;
        return;
    }
    
    booksToShow.forEach((book, index) => {
        const card = createBookCard(book, index);
        booksGrid.appendChild(card);
    });
}

// Função para adicionar seção de estatísticas
function addStatsSection() {
    const mainContent = document.querySelector('.main-content');
    const statsSection = document.createElement('div');
    statsSection.className = 'reading-stats';
    statsSection.innerHTML = `
        <div class="stats-title">
            <i class="fas fa-chart-line"></i>
            Estatísticas de Leitura
        </div>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">0</div>
                <div class="stat-label">Livros Lidos</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${books.length}</div>
                <div class="stat-label">Total de Livros</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">0 min</div>
                <div class="stat-label">Tempo Total</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">0%</div>
                <div class="stat-label">Progresso</div>
            </div>
        </div>
    `;
    
    mainContent.insertBefore(statsSection, mainContent.firstChild);
}

// Função para inicializar a aplicação
function initApp() {
    // Esconder loading
    loading.style.display = 'none';
    
    // Carregar dados salvos
    loadReadingData();
    
    // Adicionar seção de estatísticas
    addStatsSection();
    
    // Exibir livros
    displayBooks();
    
    // Adicionar evento de busca
    searchInput.addEventListener('input', (e) => {
        filterBooks(e.target.value);
    });
    
    // Adicionar evento para fechar modal
    closeModal.addEventListener('click', closeBookModal);
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBookModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeBookModal();
        }
    });
    
    // Eventos de tela cheia
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            isFullscreen = false;
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.title = 'Tela Cheia';
            }
        }
    });
    
    // Otimizações para touch
    if ('ontouchstart' in window) {
        // Adicionar feedback tátil
        const cards = document.querySelectorAll('.book-card');
        cards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }
    
    // Atualizar estatísticas periodicamente
    setInterval(updateReadingStats, 30000); // A cada 30 segundos
}

// Função para detectar se é um dispositivo Apple
function isAppleDevice() {
    return /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
}

// Otimizações específicas para dispositivos Apple
if (isAppleDevice()) {
    // Adicionar meta tag para viewport específica do iOS
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
    
    // Prevenir zoom em inputs no iOS
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
}

// Função para verificar se os PDFs existem
async function checkPDFs() {
    const pdfPromises = books.map(book => {
        return fetch(`livros/${book.filename}`)
            .then(response => response.ok)
            .catch(() => false);
    });
    
    const results = await Promise.all(pdfPromises);
    const availableBooks = books.filter((book, index) => results[index]);
    
    if (availableBooks.length === 0) {
        booksGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: #e8e8e8; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.7;"></i>
                <h3>PDFs não encontrados</h3>
                <p>Certifique-se de que os arquivos PDF estão na pasta 'livros'</p>
            </div>
        `;
        loading.style.display = 'none';
        return;
    }
    
    return availableBooks;
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const availableBooks = await checkPDFs();
        if (availableBooks) {
            // Atualizar lista de livros com apenas os disponíveis
            books.splice(0, books.length, ...availableBooks);
        }
        initApp();
    } catch (error) {
        console.error('Erro ao carregar a aplicação:', error);
        initApp();
    }
});

// Adicionar suporte para PWA (Progressive Web App)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 