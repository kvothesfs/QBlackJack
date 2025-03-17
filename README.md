# Quantum Black Jack

A 3D browser-based quantum-themed card game built with Three.js, blending the classic Black Jack with quantum mechanics concepts for an educational and entertaining experience.

## Play Now

You can play the game directly in your browser by visiting the [GitHub Pages deployment](https://kvothesfs.github.io/QBlackJack/).

## Game Overview

Quantum Black Jack adds a quantum twist to the classic card game Black Jack. Players bet and play against a dealer, with the goal of getting a hand value as close to 21 as possible without exceeding it.

The quantum twist comes from cards that can enter superposition (existing in multiple states simultaneously) and be entangled (linked so their outcomes correlate). This creates new strategic possibilities and teaches players about quantum concepts in an interactive way.

## Quantum Features

- **Superposition**: Cards can exist in two possible states simultaneously until measured
- **Entanglement**: Cards can be linked so they collapse to matching colors
- **Quantum Chips**: Special items that allow manipulation of quantum states:
  - **Hadamard Chips**: Put cards in superposition
  - **Schrödinger Chips**: Collapse superposed cards to a definite state
  - **Entanglement Chips**: Link two superposed cards

## Educational Value

Quantum Black Jack serves as an educational tool for learning quantum mechanics concepts:

- **Superposition**: The game visualizes how particles can exist in multiple states
- **Entanglement**: Players can see how measuring one particle affects another
- **Collapse**: The game demonstrates how measurement forces a definite outcome

## Technologies Used

- **Three.js**: For 3D graphics and animations
- **JavaScript**: For game logic and event handling
- **HTML5/CSS3**: For UI elements and styling

## Installation

If you want to run the game locally:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/QBlackJack.git
   ```

2. Navigate to the project directory:
   ```
   cd QBlackJack
   ```

3. Open `index.html` in your browser or use a local server.

## Development

The project is structured as follows:

- `index.html`: Main entry point
- `css/`: Styling files
- `js/`: JavaScript files
  - `quantum/`: Quantum mechanics implementation
  - `ui/`: User interface management
  - `utils/`: Utility functions and helpers
  - `models/`: 3D models and assets
- `assets/`: Game assets (images, sounds, etc.)

## How to Play

1. Place your bet
2. Receive initial cards (2 for you, 2 for the dealer with one face down)
3. Use quantum chips to manipulate your cards:
   - Use Hadamard chips to put cards in superposition
   - Use Entanglement chips to link superposed cards
   - Use Schrödinger chips to collapse cards to a definite state
4. Hit to draw more cards or Stand to end your turn
5. When you stand, all cards in superposition collapse and the dealer plays
6. The hand closest to 21 without going over wins

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the intersection of quantum mechanics and gaming
- Card assets from standard playing card designs
- Special thanks to the Three.js community for their excellent documentation 