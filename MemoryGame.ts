declare const bootstrap: any; // Add this line

// Card Interface and Class
interface Card {
  id: number;
  imageSrc: string;
  isFlipped: boolean;
  isMatched: boolean;
  element: HTMLElement;
}

class MemoryCard implements Card {
  constructor(
    public id: number,
    public imageSrc: string,
    public isFlipped: boolean = false,
    public isMatched: boolean = false,
    public element: HTMLElement
  ) {}
}

// Game Class
class MemoryGame {
  private cards: Card[] | undefined = [];
  private flippedCards: Card[] = [];
  private isLocked: boolean = false;
  private matches: number = 0;
  private progress: number = 0;
  private gameEnded: boolean = false;

  // Audio elements
  private backgroundAudio: HTMLAudioElement | null = null;
  private flipAudio: HTMLAudioElement | null = null;
  private successAudio: HTMLAudioElement | null = null;
  private failAudio: HTMLAudioElement | null = null;
  private gameOverAudio: HTMLAudioElement | null = null;
  private audioInitialized: boolean = false;

  // HTML elements
  private gameBoard: HTMLElement;
  private progressBar: HTMLElement;

  // Modal elements
  private gameOverModal: HTMLElement;
  private modalContent: HTMLElement;
  private modalIcon: HTMLElement;
  private modalTitle: HTMLElement;

  constructor() {
    // Initialize HTML elements
    this.gameBoard = document.getElementById("gameBoard")!;
    this.progressBar = document.getElementById("progressBar")!;

    // Initialize modal elements
    this.gameOverModal = document.getElementById("gameOverModal")!;
    this.modalContent = document.getElementById("modalContent")!;
    this.modalIcon = document.getElementById("modalIcon")!;
    this.modalTitle = document.getElementById("modalTitle")!;

    this.initializeGame();
  }

  private initializeGame(): void {
    this.gameEnded = false;
    this.setupEventListeners();
    this.createCards();
    this.shuffleCards();
    this.renderCards();
    this.updateDisplay();
    this.focusOnGameBoard();
    this.hideModal();
  }

  private focusOnGameBoard(): void {
    setTimeout(() => {
      this.gameBoard.scrollIntoView({ behavior: "smooth", block: "center" });
      this.gameBoard.focus();
    }, 100);
  }

  private setupEventListeners(): void {
    const initializeAudioOnInteraction = () => {
      if (!this.audioInitialized) {
        this.initializeAudio();
        this.startBackgroundMusic();
      }
    };

    document.addEventListener("click", initializeAudioOnInteraction, {
      once: true,
    });
  }

  private initializeAudio(): void {
    if (this.audioInitialized) return;

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
      ].forEach((audio) => {
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
    } catch (error) {
      console.error("Error initializing audio:", error);
      this.audioInitialized = false;
    }
  }

  private stopBackgroundMusic(): void {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio.currentTime = 0;
    }
  }

  private startBackgroundMusic(): void {
    if (!this.backgroundAudio || !this.audioInitialized) return;

    this.backgroundAudio.play().catch((e) => {
      console.log(
        "Background music autoplay blocked. Will play on next interaction:",
        e
      );
    });
  }

  private playSound(audioType: "flip" | "success" | "fail" | "gameOver"): void {
    if (!this.audioInitialized) {
      this.initializeAudio();
    }

    if (!this.audioInitialized) return;

    let audio: HTMLAudioElement | null = null;

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
      audio.play().catch((e) => {
        console.log(`Audio ${audioType} play failed:`, e);
      });
    }
  }

  private createCards(): void {
    const imageSources = [
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

    let id = 1;
    imageSources.forEach((src) => {
      for (let i = 0; i < 2; i++) {
        const cardElement = document.createElement("div");
        cardElement.className = "col p-1";

        cardElement.innerHTML = `
          <div class="card h-100 shadow-sm card-container" data-card-id="${id}" style="cursor: pointer; aspect-ratio: 3/4; border: 2px solid transparent;">
            <div class="card-body p-1 d-flex align-items-center justify-content-center bg-primary text-white h-100 rounded" style="overflow: hidden;">
              <img src="./Resources/Imgs/back.jpg" alt="Card Back" class="img-fluid card-image" style="object-fit: contain; max-width: 100%; max-height: 100%;">
            </div>
            <div class="card-body p-1 d-none d-flex align-items-center justify-content-center bg-white h-100 rounded" style="overflow: hidden;">
              <img src="${src}" alt="Card Image" class="img-fluid card-image" style="object-fit: contain; max-width: 100%; max-height: 100%;">
            </div>
          </div>
        `;
        this.cards?.push(new MemoryCard(id++, src, false, false, cardElement));
      }
    });
  }

  private shuffleCards(): void {
    if (!this.cards) return;
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  private renderCards(): void {
    this.gameBoard.innerHTML = "";

    for (let row = 0; row < 4; row++) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "row row-cols-5 g-0 justify-content-center";

      for (let col = 0; col < 5; col++) {
        const cardIndex = row * 5 + col;
        if (this.cards && cardIndex < this.cards.length) {
          const card = this.cards[cardIndex];

          const cardDiv = card?.element.querySelector(".card") as HTMLElement;
          cardDiv.onclick = () => this.handleCardClick(card);

          rowDiv.appendChild(card.element);
        }
      }

      this.gameBoard.appendChild(rowDiv);
    }
  }

  private handleCardClick(card: Card): void {
    if (this.isLocked || card.isFlipped || card.isMatched || this.gameEnded) {
      return;
    }

    this.flipCard(card);
    this.playSound("flip");

    if (this.flippedCards.length === 2) {
      this.checkForMatch();
    }
  }

  private flipCard(card: Card): void {
    card.isFlipped = true;
    const cardDiv = card.element.querySelector(".card") as HTMLElement;
    const backSide = cardDiv.querySelector(".bg-primary") as HTMLElement;
    const frontSide = cardDiv.querySelector(".bg-white") as HTMLElement;

    backSide.classList.add("d-none");
    frontSide.classList.remove("d-none");

    cardDiv.classList.add("border-success", "border-2");

    this.flippedCards.push(card);
  }

  private unflipCard(card: Card): void {
    card.isFlipped = false;
    const cardDiv = card.element.querySelector(".card") as HTMLElement;
    const backSide = cardDiv.querySelector(".bg-primary") as HTMLElement;
    const frontSide = cardDiv.querySelector(".bg-white") as HTMLElement;

    backSide.classList.remove("d-none");
    frontSide.classList.add("d-none");

    cardDiv.classList.remove("border-success", "border-2");
  }

  private checkForMatch(): void {
    this.isLocked = true;

    const [card1, card2] = this.flippedCards;

    if (card1?.imageSrc === card2?.imageSrc) {
      this.handleMatch();
    } else {
      this.handleMismatch();
    }

    this.updateDisplay();
  }

  private handleMatch(): void {
    this.flippedCards.forEach((card) => {
      card.isMatched = true;
      const cardDiv = card.element.querySelector(".card") as HTMLElement;
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
  }

  private handleMismatch(): void {
    this.playSound("fail");

    setTimeout(() => {
      this.flippedCards.forEach((card) => {
        this.unflipCard(card);
      });

      this.flippedCards = [];
      this.isLocked = false;
    }, 1000);
  }

  private updateDisplay(): void {
    this.progressBar.style.width = `${this.progress}%`;
    this.progressBar.setAttribute("aria-valuenow", this.progress.toString());
    this.progressBar.textContent = `${Math.round(this.progress)}%`;
  }

  private showModal(isWin: boolean): void {
    if (isWin) {
      this.modalContent.className = "modal-content modal-content-custom winner";
      this.modalIcon.textContent = "🎉";
      this.modalTitle.textContent = "You Win!";
    } else {
      this.modalContent.className = "modal-content modal-content-custom loser";
      this.modalIcon.textContent = "⏰";
      this.modalTitle.textContent = "Time's Up!";
    }

    // Use Bootstrap's modal show method - FIXED LINE
    const modal = new bootstrap.Modal(this.gameOverModal);
    modal.show();
  }

  private hideModal(): void {
    const modal = bootstrap.Modal.getInstance(this.gameOverModal);
    if (modal) {
      modal.hide();
    }
  }

  private endGame(isWin: boolean): void {
    if (this.gameEnded) return;

    this.gameEnded = true;

    this.stopBackgroundMusic();

    if (!isWin) {
      this.playSound("gameOver");
    }

    setTimeout(() => {
      this.showModal(isWin);
    }, 500);
  }

  public restartGame(): void {
    this.stopBackgroundMusic();
    this.hideModal();

    this.cards = [];
    this.flippedCards = [];
    this.isLocked = false;
    this.matches = 0;
    this.progress = 0;

    this.initializeGame();
  }
}

// Make game instance global so modal button can access it
let game: MemoryGame;

document.addEventListener("DOMContentLoaded", () => {
  game = new MemoryGame();
});
