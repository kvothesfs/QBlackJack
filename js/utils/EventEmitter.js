export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }

    once(event, listener) {
        const onceWrapper = (...args) => {
            listener(...args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
        return this;
    }

    off(event, listener) {
        if (!this.events[event]) return this;
        
        if (!listener) {
            delete this.events[event];
            return this;
        }
        
        const idx = this.events[event].indexOf(listener);
        if (idx !== -1) {
            this.events[event].splice(idx, 1);
        }
        return this;
    }

    emit(event, ...args) {
        if (!this.events[event]) return false;
        
        this.events[event].forEach(listener => {
            listener(...args);
        });
        return true;
    }
} 