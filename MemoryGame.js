var MemoryCard = /** @class */ (function () {
    function MemoryCard(id, imageSrc, isFlipped, isMatched, element) {
        if (isFlipped === void 0) { isFlipped = false; }
        if (isMatched === void 0) { isMatched = false; }
        this.id = id;
        this.imageSrc = imageSrc;
        this.isFlipped = isFlipped;
        this.isMatched = isMatched;
        this.element = element;
    }
    return MemoryCard;
}());
// Game Class
var MemoryGame = /** @class */ (function () {
    function MemoryGame() {
        this.cards = [];
        this.flippedCards = [];
        this.isLocked = false;
        this.matches = 0;
        this.progress = 0;
        this.gameEnded = false;
        // Audio elements
        this.backgroundAudio = null;
        this.flipAudio = null;
        this.successAudio = null;
        this.failAudio = null;
        this.gameOverAudio = null;
        this.audioInitialized = false;
        // Initialize HTML elements
        this.gameBoard = document.getElementById("gameBoard");
        this.progressBar = document.getElementById("progressBar");
        // Initialize modal elements
        this.gameOverModal = document.getElementById("gameOverModal");
        this.modalContent = document.getElementById("modalContent");
        this.modalIcon = document.getElementById("modalIcon");
        this.modalTitle = document.getElementById("modalTitle");
        this.initializeGame();
    }
    MemoryGame.prototype.initializeGame = function () {
        this.gameEnded = false;
        this.setupEventListeners();
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.updateDisplay();
        this.focusOnGameBoard();
        this.hideModal();
    };
    MemoryGame.prototype.focusOnGameBoard = function () {
        var _this = this;
        setTimeout(function () {
            _this.gameBoard.scrollIntoView({ behavior: "smooth", block: "center" });
            _this.gameBoard.focus();
        }, 100);
    };
    MemoryGame.prototype.setupEventListeners = function () {
        var _this = this;
        var initializeAudioOnInteraction = function () {
            if (!_this.audioInitialized) {
                _this.initializeAudio();
                _this.startBackgroundMusic();
            }
        };
        document.addEventListener("click", initializeAudioOnInteraction, {
            once: true,
        });
    };
    MemoryGame.prototype.initializeAudio = function () {
        if (this.audioInitialized)
            return;
        this.audioInitialized = true;
        try {
            this.flipAudio = new Audio("./Resources/Audio/flip.mp3");
            this.successAudio = new Audio("./Resources/Audio/good.mp3");
            this.failAudio = new Audio("./Resources/Audio/fail.mp3");
            this.gameOverAudio = new Audio("./Resources/Audio/game-over.mp3");
            this.backgroundAudio = new Audio("./Resources/Audio/fulltrack.mp3");
            [
                this.flipAudio,
                this.successAudio,
                this.failAudio,
                this.gameOverAudio,
            ].forEach(function (audio) {
                if (audio) {
                    audio.volume = 0.6;
                    audio.preload = "auto";
                    audio.load();
                }
            });
            if (this.backgroundAudio) {
                this.backgroundAudio.loop = true;
                this.backgroundAudio.volume = 0.3;
                this.backgroundAudio.preload = "auto";
                this.backgroundAudio.load();
            }
            console.log("Audio initialized successfully");
        }
        catch (error) {
            console.error("Error initializing audio:", error);
            this.audioInitialized = false;
        }
    };
    MemoryGame.prototype.stopBackgroundMusic = function () {
        if (this.backgroundAudio) {
            this.backgroundAudio.pause();
            this.backgroundAudio.currentTime = 0;
        }
    };
    MemoryGame.prototype.startBackgroundMusic = function () {
        if (!this.backgroundAudio || !this.audioInitialized)
            return;
        this.backgroundAudio.play().catch(function (e) {
            console.log("Background music autoplay blocked. Will play on next interaction:", e);
        });
    };
    MemoryGame.prototype.playSound = function (audioType) {
        if (!this.audioInitialized) {
            this.initializeAudio();
        }
        if (!this.audioInitialized)
            return;
        var audio = null;
        switch (audioType) {
            case "flip":
                audio = this.flipAudio;
                break;
            case "success":
                audio = this.successAudio;
                break;
            case "fail":
                audio = this.failAudio;
                break;
            case "gameOver":
                audio = this.gameOverAudio;
                break;
        }
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(function (e) {
                console.log("Audio ".concat(audioType, " play failed:"), e);
            });
        }
    };
    MemoryGame.prototype.createCards = function () {
        var _this = this;
        var imageSources = [
            "./Resources/Imgs/0.jpg",
            "./Resources/Imgs/1.jpg",
            "./Resources/Imgs/2.jpg",
            "./Resources/Imgs/3.jpg",
            "./Resources/Imgs/4.jpg",
            "./Resources/Imgs/5.jpg",
            "./Resources/Imgs/6.jpg",
            "./Resources/Imgs/7.jpg",
            "./Resources/Imgs/8.jpg",
            "./Resources/Imgs/9.jpg",
        ];
        var id = 1;
        imageSources.forEach(function (src) {
            var _a;
            for (var i = 0; i < 2; i++) {
                var cardElement = document.createElement("div");
                cardElement.className = "col p-1";
                cardElement.innerHTML = "\n          <div class=\"card h-100 shadow-sm card-container\" data-card-id=\"".concat(id, "\" style=\"cursor: pointer; aspect-ratio: 3/4; border: 2px solid transparent;\">\n            <div class=\"card-body p-1 d-flex align-items-center justify-content-center bg-primary text-white h-100 rounded\" style=\"overflow: hidden;\">\n              <img src=\"./Resources/Imgs/back.jpg\" alt=\"Card Back\" class=\"img-fluid card-image\" style=\"object-fit: contain; max-width: 100%; max-height: 100%;\">\n            </div>\n            <div class=\"card-body p-1 d-none d-flex align-items-center justify-content-center bg-white h-100 rounded\" style=\"overflow: hidden;\">\n              <img src=\"").concat(src, "\" alt=\"Card Image\" class=\"img-fluid card-image\" style=\"object-fit: contain; max-width: 100%; max-height: 100%;\">\n            </div>\n          </div>\n        ");
                (_a = _this.cards) === null || _a === void 0 ? void 0 : _a.push(new MemoryCard(id++, src, false, false, cardElement));
            }
        });
    };
    MemoryGame.prototype.shuffleCards = function () {
        var _a;
        if (!this.cards)
            return;
        for (var i = this.cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [this.cards[j], this.cards[i]], this.cards[i] = _a[0], this.cards[j] = _a[1];
        }
    };
    MemoryGame.prototype.renderCards = function () {
        var _this = this;
        this.gameBoard.innerHTML = "";
        for (var row = 0; row < 4; row++) {
            var rowDiv = document.createElement("div");
            rowDiv.className = "row row-cols-5 g-0 justify-content-center";
            var _loop_1 = function (col) {
                var cardIndex = row * 5 + col;
                if (this_1.cards && cardIndex < this_1.cards.length) {
                    var card_1 = this_1.cards[cardIndex];
                    var cardDiv = card_1 === null || card_1 === void 0 ? void 0 : card_1.element.querySelector(".card");
                    cardDiv.onclick = function () { return _this.handleCardClick(card_1); };
                    rowDiv.appendChild(card_1.element);
                }
            };
            var this_1 = this;
            for (var col = 0; col < 5; col++) {
                _loop_1(col);
            }
            this.gameBoard.appendChild(rowDiv);
        }
    };
    MemoryGame.prototype.handleCardClick = function (card) {
        if (this.isLocked || card.isFlipped || card.isMatched || this.gameEnded) {
            return;
        }
        this.flipCard(card);
        this.playSound("flip");
        if (this.flippedCards.length === 2) {
            this.checkForMatch();
        }
    };
    MemoryGame.prototype.flipCard = function (card) {
        card.isFlipped = true;
        var cardDiv = card.element.querySelector(".card");
        var backSide = cardDiv.querySelector(".bg-primary");
        var frontSide = cardDiv.querySelector(".bg-white");
        backSide.classList.add("d-none");
        frontSide.classList.remove("d-none");
        cardDiv.classList.add("border-success", "border-2");
        this.flippedCards.push(card);
    };
    MemoryGame.prototype.unflipCard = function (card) {
        card.isFlipped = false;
        var cardDiv = card.element.querySelector(".card");
        var backSide = cardDiv.querySelector(".bg-primary");
        var frontSide = cardDiv.querySelector(".bg-white");
        backSide.classList.remove("d-none");
        frontSide.classList.add("d-none");
        cardDiv.classList.remove("border-success", "border-2");
    };
    MemoryGame.prototype.checkForMatch = function () {
        this.isLocked = true;
        var _a = this.flippedCards, card1 = _a[0], card2 = _a[1];
        if ((card1 === null || card1 === void 0 ? void 0 : card1.imageSrc) === (card2 === null || card2 === void 0 ? void 0 : card2.imageSrc)) {
            this.handleMatch();
        }
        else {
            this.handleMismatch();
        }
        this.updateDisplay();
    };
    MemoryGame.prototype.handleMatch = function () {
        this.flippedCards.forEach(function (card) {
            card.isMatched = true;
            var cardDiv = card.element.querySelector(".card");
            cardDiv.classList.remove("border-success");
            cardDiv.classList.add("border-warning", "border-3", "bg-light");
            cardDiv.onclick = null;
        });
        this.matches++;
        this.progress = (this.matches / 10) * 100;
        this.playSound("success");
        this.flippedCards = [];
        this.isLocked = false;
        if (this.matches === 10) {
            this.endGame(true);
        }
    };
    MemoryGame.prototype.handleMismatch = function () {
        var _this = this;
        this.playSound("fail");
        setTimeout(function () {
            _this.flippedCards.forEach(function (card) {
                _this.unflipCard(card);
            });
            _this.flippedCards = [];
            _this.isLocked = false;
        }, 1000);
    };
    MemoryGame.prototype.updateDisplay = function () {
        this.progressBar.style.width = "".concat(this.progress, "%");
        this.progressBar.setAttribute("aria-valuenow", this.progress.toString());
        this.progressBar.textContent = "".concat(Math.round(this.progress), "%");
    };
    MemoryGame.prototype.showModal = function (isWin) {
        if (isWin) {
            this.modalContent.className = "modal-content modal-content-custom winner";
            this.modalIcon.textContent = "🎉";
            this.modalTitle.textContent = "You Win!";
        }
        else {
            this.modalContent.className = "modal-content modal-content-custom loser";
            this.modalIcon.textContent = "⏰";
            this.modalTitle.textContent = "Time's Up!";
        }
        // Use Bootstrap's modal show method - FIXED LINE
        var modal = new bootstrap.Modal(this.gameOverModal);
        modal.show();
    };
    MemoryGame.prototype.hideModal = function () {
        var modal = bootstrap.Modal.getInstance(this.gameOverModal);
        if (modal) {
            modal.hide();
        }
    };
    MemoryGame.prototype.endGame = function (isWin) {
        var _this = this;
        if (this.gameEnded)
            return;
        this.gameEnded = true;
        this.stopBackgroundMusic();
        if (!isWin) {
            this.playSound("gameOver");
        }
        setTimeout(function () {
            _this.showModal(isWin);
        }, 500);
    };
    MemoryGame.prototype.restartGame = function () {
        this.stopBackgroundMusic();
        this.hideModal();
        this.cards = [];
        this.flippedCards = [];
        this.isLocked = false;
        this.matches = 0;
        this.progress = 0;
        this.initializeGame();
    };
    return MemoryGame;
}());
// Make game instance global so modal button can access it
var game;
document.addEventListener("DOMContentLoaded", function () {
    game = new MemoryGame();
});
