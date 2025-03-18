export class TutorialManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.tutorialShown = {
            blackjack: false,
            poker: false
        };
    }

    showTutorial(gameType) {
        const tutorialOverlay = document.getElementById('tutorial-overlay');
        const tutorialTitle = document.querySelector('.tutorial-title');
        const tutorialContent = document.getElementById('tutorial-content');
        const tutorialNextBtn = document.getElementById('tutorial-next-btn');
        
        if (!tutorialOverlay || !tutorialTitle || !tutorialContent || !tutorialNextBtn) {
            console.error("Tutorial elements not found");
            return;
        }
        
        // Set tutorial content based on game type
        let tutorialSteps = [];
        
        if (gameType === 'blackjack') {
            tutorialTitle.textContent = "Welcome to Quantum Blackjack!";
            tutorialSteps = [
                "Your goal is to get a hand value closer to 21 than the dealer without going over.",
                "Cards 2-10 are worth their face value. Face cards are worth 10. Aces are worth 1 or 11.",
                "You'll start with two cards. The dealer gets two cards with one face down.",
                "You can Hit to get another card, or Stand to keep your current hand.",
                "The Hadamard button puts a card in superposition between two states.",
                "The Schrödinger button measures a superposed card, collapsing it to one state.",
                "The Entanglement button links two superposed cards, forcing them to collapse to the same suit color.",
                "Use quantum mechanics wisely to beat the dealer!"
            ];
        } else if (gameType === 'poker') {
            tutorialTitle.textContent = "Welcome to Quantum Texas Hold'Em!";
            tutorialSteps = [
                "You'll be dealt two private cards, followed by five community cards revealed in stages.",
                "The best five-card hand wins the pot.",
                "Betting rounds occur before the deal, after the flop (first 3 cards), turn (4th card), and river (5th card).",
                "You can Check (pass), Bet/Raise (add chips), Call (match bet), or Fold (give up).",
                "The Hadamard button puts a card in superposition between two states.",
                "The Schrödinger button measures a superposed card, collapsing it to one state.",
                "The Entanglement button links two superposed cards, forcing them to collapse to the same suit color.",
                "Use your quantum powers wisely to win the pot!"
            ];
        }
        
        let currentStep = 0;
        
        // Display first step
        tutorialContent.textContent = tutorialSteps[currentStep];
        tutorialOverlay.style.display = 'flex';
        
        // Handle next button clicks
        const handleNextClick = () => {
            currentStep++;
            
            if (currentStep < tutorialSteps.length) {
                tutorialContent.textContent = tutorialSteps[currentStep];
            } else {
                // End of tutorial
                tutorialOverlay.style.display = 'none';
                this.tutorialShown[gameType] = true;
                
                // Remove event listener to prevent memory leaks
                tutorialNextBtn.removeEventListener('click', handleNextClick);
                
                // Start the game
                if (this.gameManager) {
                    this.gameManager.startNewGame();
                }
            }
        };
        
        // Attach event listener
        tutorialNextBtn.addEventListener('click', handleNextClick);
    }
} 