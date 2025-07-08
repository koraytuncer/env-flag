/**
 * Environment Flag - A lightweight library to display environment indicators
 * @version 1.0.0
 */
class EnvFlag {
    constructor(config = {}) {
        this.flagElement = null;
        this.eventListeners = [];
        this.config = Object.assign(Object.assign({}, EnvFlag.DEFAULT_CONFIG), config);
        if (this.config.debug) {
            console.log('[EnvFlag] Initialized with config:', this.config);
        }
    }
    /**
     * Initialize the environment flag
     */
    init() {
        try {
            if (!this.isValidEnvironment()) {
                if (this.config.debug) {
                    console.warn('[EnvFlag] Invalid environment, skipping initialization');
                }
                return;
            }
            if (!this.config.enabled) {
                if (this.config.debug) {
                    console.log('[EnvFlag] Flag is disabled');
                }
                return;
            }
            this.destroy(); // Clean up any existing flag
            this.createFlag();
            if (this.config.debug) {
                console.log('[EnvFlag] Flag created successfully');
            }
        }
        catch (error) {
            console.error('[EnvFlag] Failed to initialize:', error);
        }
    }
    /**
     * Destroy the environment flag and clean up resources
     */
    destroy() {
        try {
            this.removeEventListeners();
            this.removeFlagElement();
            if (this.config.debug) {
                console.log('[EnvFlag] Flag destroyed and resources cleaned up');
            }
        }
        catch (error) {
            console.error('[EnvFlag] Error during cleanup:', error);
        }
    }
    /**
     * Update configuration and recreate flag
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.init();
    }
    /**
     * Get current environment
     */
    getCurrentEnvironment() {
        if (this.config.forceEnv) {
            return this.config.forceEnv;
        }
        if (!this.config.autoDetectEnv) {
            return 'development';
        }
        return this.detectEnvironment();
    }
    isValidEnvironment() {
        if (typeof window === 'undefined') {
            if (this.config.debug) {
                console.warn('[EnvFlag] Window is undefined, likely running in Node.js environment');
            }
            return false;
        }
        if (typeof document === 'undefined') {
            if (this.config.debug) {
                console.warn('[EnvFlag] Document is undefined');
            }
            return false;
        }
        return true;
    }
    detectEnvironment() {
        var _a, _b, _c;
        // Check various environment indicators
        const indicators = {
            hostname: ((_a = window.location) === null || _a === void 0 ? void 0 : _a.hostname) || '',
            nodeEnv: ((_c = (_b = globalThis.process) === null || _b === void 0 ? void 0 : _b.env) === null || _c === void 0 ? void 0 : _c.NODE_ENV) || '',
            userAgent: (navigator === null || navigator === void 0 ? void 0 : navigator.userAgent) || ''
        };
        if (this.config.debug) {
            console.log('[EnvFlag] Environment indicators:', indicators);
        }
        // Production indicators
        if (indicators.nodeEnv === 'production' ||
            indicators.hostname.includes('prod') ||
            !indicators.hostname.includes('localhost') &&
                !indicators.hostname.includes('127.0.0.1') &&
                !indicators.hostname.includes('dev') &&
                !indicators.hostname.includes('staging')) {
            return 'production';
        }
        // Staging indicators
        if (indicators.nodeEnv === 'staging' ||
            indicators.hostname.includes('staging') ||
            indicators.hostname.includes('stage')) {
            return 'staging';
        }
        // Test indicators
        if (indicators.nodeEnv === 'test' ||
            indicators.hostname.includes('test')) {
            return 'test';
        }
        // Default to development
        return 'development';
    }
    createFlag() {
        const environment = this.getCurrentEnvironment();
        this.flagElement = document.createElement('div');
        this.flagElement.id = EnvFlag.ELEMENT_ID;
        this.flagElement.setAttribute('data-env', environment);
        this.flagElement.setAttribute('role', 'status');
        this.flagElement.setAttribute('aria-label', `Environment: ${environment}`);
        this.applyStyles(environment);
        this.attachEventListeners();
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            if (this.flagElement && document.body) {
                document.body.appendChild(this.flagElement);
            }
        });
    }
    applyStyles(environment) {
        if (!this.flagElement)
            return;
        const styles = this.getEnvironmentStyles(environment);
        const positionStyles = this.getPositionStyles();
        const sizeStyles = this.getSizeStyles();
        // Apply base styles
        Object.assign(this.flagElement.style, Object.assign(Object.assign({ 
            // Content
            textContent: this.getEnvironmentText(environment), 
            // Colors
            backgroundColor: styles.backgroundColor, color: styles.color, 
            // Typography
            fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif', fontWeight: '600', fontSize: sizeStyles.fontSize, lineHeight: '1', textAlign: 'center', 
            // Layout
            position: 'fixed', zIndex: EnvFlag.Z_INDEX, padding: sizeStyles.padding, 
            // Visual
            borderRadius: positionStyles.borderRadius, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(8px)', opacity: styles.opacity, 
            // Interaction
            cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s ease-in-out' }, this.getPositionCoordinates()), { 
            // Accessibility
            outline: 'none' }));
        this.flagElement.textContent = this.getEnvironmentText(environment);
    }
    getEnvironmentStyles(environment) {
        const colorMap = {
            production: this.config.productionColor,
            development: this.config.developmentColor,
            staging: this.config.stagingColor,
            test: this.config.testColor
        };
        return {
            backgroundColor: colorMap[environment],
            color: '#ffffff',
            fontSize: this.getSizeStyles().fontSize,
            padding: this.getSizeStyles().padding,
            borderRadius: this.getPositionStyles().borderRadius,
            opacity: '0.9'
        };
    }
    getEnvironmentText(environment) {
        const textMap = {
            production: this.config.productionText,
            development: this.config.developmentText,
            staging: this.config.stagingText,
            test: this.config.testText
        };
        return textMap[environment];
    }
    getSizeStyles() {
        const sizeMap = {
            small: { fontSize: '10px', padding: '4px 8px' },
            medium: { fontSize: '12px', padding: '6px 12px' },
            large: { fontSize: '14px', padding: '8px 16px' }
        };
        return sizeMap[this.config.size];
    }
    getPositionStyles() {
        const radiusMap = {
            'top-right': '0 0 0 4px',
            'top-left': '0 0 4px 0',
            'bottom-left': '0 4px 0 0',
            'bottom-right': '4px 0 0 0'
        };
        return { borderRadius: radiusMap[this.config.position] };
    }
    getPositionCoordinates() {
        const coordinateMap = {
            'top-right': { top: '0', right: '0' },
            'top-left': { top: '0', left: '0' },
            'bottom-left': { bottom: '0', left: '0' },
            'bottom-right': { bottom: '0', right: '0' }
        };
        return coordinateMap[this.config.position];
    }
    attachEventListeners() {
        if (!this.flagElement)
            return;
        // Click to remove
        const clickHandler = this.handleClick.bind(this);
        this.flagElement.addEventListener('click', clickHandler);
        this.eventListeners.push({
            element: this.flagElement,
            event: 'click',
            handler: clickHandler
        });
        // Hover effects
        const mouseEnterHandler = this.handleMouseEnter.bind(this);
        const mouseLeaveHandler = this.handleMouseLeave.bind(this);
        this.flagElement.addEventListener('mouseenter', mouseEnterHandler);
        this.flagElement.addEventListener('mouseleave', mouseLeaveHandler);
        this.eventListeners.push({
            element: this.flagElement,
            event: 'mouseenter',
            handler: mouseEnterHandler
        }, {
            element: this.flagElement,
            event: 'mouseleave',
            handler: mouseLeaveHandler
        });
        // Keyboard accessibility
        const keydownHandler = this.handleKeydown.bind(this);
        this.flagElement.addEventListener('keydown', keydownHandler);
        this.flagElement.setAttribute('tabindex', '0');
        this.eventListeners.push({
            element: this.flagElement,
            event: 'keydown',
            handler: keydownHandler
        });
    }
    handleClick() {
        this.destroy();
    }
    handleMouseEnter() {
        if (this.flagElement) {
            this.flagElement.style.opacity = '1';
            this.flagElement.style.transform = 'scale(1.05)';
        }
    }
    handleMouseLeave() {
        if (this.flagElement) {
            this.flagElement.style.opacity = '0.9';
            this.flagElement.style.transform = 'scale(1)';
        }
    }
    handleKeydown(event) {
        const keyboardEvent = event;
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
            keyboardEvent.preventDefault();
            this.destroy();
        }
    }
    removeEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
    removeFlagElement() {
        var _a;
        if (this.flagElement && ((_a = document.body) === null || _a === void 0 ? void 0 : _a.contains(this.flagElement))) {
            document.body.removeChild(this.flagElement);
            this.flagElement = null;
        }
    }
}
EnvFlag.DEFAULT_CONFIG = {
    productionColor: '#e74c3c',
    developmentColor: '#3498db',
    stagingColor: '#f39c12',
    testColor: '#9b59b6',
    productionText: 'PROD',
    developmentText: 'DEV',
    stagingText: 'STAGING',
    testText: 'TEST',
    position: 'bottom-right',
    size: 'medium',
    autoDetectEnv: true,
    enabled: true,
    debug: false
};
EnvFlag.ELEMENT_ID = 'env-flag-indicator';
EnvFlag.Z_INDEX = '999999';
// Auto-initialization for immediate testing
if (typeof window !== 'undefined') {
    const autoEnvFlag = new EnvFlag({
        debug: true // Enable debug mode for testing
    });
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => autoEnvFlag.init());
    }
    else {
        // DOM is already ready
        autoEnvFlag.init();
    }
}
export default EnvFlag;
