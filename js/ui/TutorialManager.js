export class TutorialManager {
    constructor() {
        this.tutorialDialog = document.getElementById('tutorial-dialog');
        this.tutorialContent = document.getElementById('tutorial-content');
        this.tutorialNext = document.getElementById('tutorial-next');
        
        this.currentStep = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.tutorialNext.addEventListener('click', () => this.nextStep());
    }

    showTutorial() {
        this.currentStep = 0;
        this.updateContent();
        this.tutorialDialog.style.display = 'block';
    }

    nextStep() {
        this.currentStep++;
        
        if (this.currentStep >= this.tutorialSteps.length) {
            // End of tutorial
            this.tutorialDialog.style.display = 'none';
            this.currentStep = 0;
        } else {
            this.updateContent();
        }
    }

    updateContent() {
        const step = this.tutorialSteps[this.currentStep];
        
        // Update tutorial dialog title
        this.tutorialDialog.querySelector('h2').textContent = step.title;
        
        // Update content
        this.tutorialContent.innerHTML = step.content;
        
        // Update button text for last step
        if (this.currentStep === this.tutorialSteps.length - 1) {
            this.tutorialNext.textContent = 'Start Playing';
        } else {
            this.tutorialNext.textContent = 'Next';
        }
    }

    // Tutorial content
    tutorialSteps = [
        {
            title: 'Welcome to Quantum Black Jack!',
            content: `
                <p>In this game, you'll be playing a quantum twist on the classic Blackjack card game. 
                The goal is still to beat the dealer without going over 21, but with some quantum mechanics mixed in!</p>
                <p>This tutorial will guide you through the basics of the game and teach you some quantum concepts along the way.</p>
            `
        },
        {
            title: 'Basic Rules',
            content: `
                <p>The basic rules of Blackjack still apply:</p>
                <ul>
                    <li>Cards 2-10 are worth their face value</li>
                    <li>Face cards (Jack, Queen, King) are worth 10</li>
                    <li>Aces are worth 11 or 1, whichever is more favorable</li>
                    <li>Your goal is to get closer to 21 than the dealer without going over</li>
                </ul>
            `
        },
        {
            title: 'What is Quantum Mechanics?',
            content: `
                <p>Quantum mechanics is a branch of physics that deals with the behavior of matter at the smallest scales.</p>
                <p>In our everyday world, objects have definite properties - a card is either a 5 of Spades or it isn't.</p>
                <p>But in the quantum world, particles can exist in multiple states simultaneously until measured - this is called <strong>superposition</strong>.</p>
            `
        },
        {
            title: 'Quantum Cards: Superposition',
            content: `
                <p>In Quantum Black Jack, each card can be put into <strong>superposition</strong> using a Hadamard chip (H).</p>
                <p>A card in superposition (glowing cyan) exists as two different cards simultaneously until measured.</p>
                <p>For example, a card might be both a 2 of Hearts AND a 10 of Clubs until you observe it!</p>
                <p>When superposed cards are "measured" (when the hand ends or when using a Schrödinger chip), they collapse to just one of the possible states.</p>
            `
        },
        {
            title: 'Quantum Cards: Entanglement',
            content: `
                <p><strong>Quantum entanglement</strong> is another strange quantum phenomenon where two particles become linked, even across vast distances.</p>
                <p>In our game, you can entangle two cards in superposition using an Entanglement chip (E).</p>
                <p>Entangled cards (glowing magenta) are connected so that when one collapses, it affects the other.</p>
                <p>Specifically, entangled cards will always collapse to the same color (both red or both black).</p>
            `
        },
        {
            title: 'Quantum Chip Types',
            content: `
                <p>You have three types of quantum chips:</p>
                <ul>
                    <li><strong>Hadamard (H)</strong>: Put a card into superposition, so it exists in two states at once</li>
                    <li><strong>Schrödinger (S)</strong>: Force a card in superposition to collapse to a single state</li>
                    <li><strong>Entanglement (E)</strong>: Link two cards in superposition so they collapse to matching colors</li>
                </ul>
                <p>Use these chips strategically to improve your chances of winning!</p>
            `
        },
        {
            title: 'How to Play',
            content: `
                <p>1. Place your bet by clicking the "Bet" button</p>
                <p>2. Select cards by clicking on them (they'll rise slightly)</p>
                <p>3. Use quantum chips by clicking on the chip buttons on the left</p>
                <p>4. Hit to draw more cards or Stand to end your turn</p>
                <p>5. When you stand, all your superposed cards will collapse and the dealer will play</p>
                <p>6. The hand closest to 21 without going over wins!</p>
            `
        },
        {
            title: 'Strategy Tips',
            content: `
                <p>Here are some strategic tips:</p>
                <ul>
                    <li>Use Hadamard chips on low cards that might bust you</li>
                    <li>Use Schrödinger chips when you're confident of a good outcome</li>
                    <li>Entangle cards when you want to ensure matching colors (which often means similar values)</li>
                    <li>Remember that the dealer must hit on 16 and stand on 17</li>
                </ul>
            `
        },
        {
            title: 'Ready to Play?',
            content: `
                <p>You start with 3 of each quantum chip and $1000.</p>
                <p>You can buy more chips in the shop as you win money.</p>
                <p>Good luck, and may quantum uncertainty be in your favor!</p>
            `
        }
    ];
} 