export class TutorialManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }

    showTutorial() {
        // Use the UIManager to show the tutorial
        if (this.uiManager) {
            this.uiManager.showTutorial();
        }
    }
} 