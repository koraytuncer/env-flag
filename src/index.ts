/**
 * Environment Flag - A lightweight library to display environment indicators
 * @version 1.0.0
 */

type Environment = 'development' | 'production' | 'staging' | 'test';
type Position = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
type Size = 'small' | 'medium' | 'large';

interface EnvFlagConfig {
  readonly productionColor?: string;
  readonly developmentColor?: string;
  readonly stagingColor?: string;
  readonly testColor?: string;
  readonly productionText?: string;
  readonly developmentText?: string;
  readonly stagingText?: string;
  readonly testText?: string;
  readonly position?: Position;
  readonly size?: Size;
  readonly autoDetectEnv?: boolean;
  readonly forceEnv?: Environment;
  readonly enabled?: boolean;
  readonly debug?: boolean;
}

interface EnvFlagStyles {
  readonly backgroundColor: string;
  readonly color: string;
  readonly fontSize: string;
  readonly padding: string;
  readonly borderRadius: string;
  readonly opacity: string;
}

class EnvFlag {
  private static readonly DEFAULT_CONFIG: Required<Omit<EnvFlagConfig, 'forceEnv'>> = {
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

  private static readonly ELEMENT_ID = 'env-flag-indicator';
  private static readonly Z_INDEX = '999999';

  private readonly config: Required<Omit<EnvFlagConfig, 'forceEnv'>> & Pick<EnvFlagConfig, 'forceEnv'>;
  private flagElement: HTMLElement | null = null;
  private eventListeners: Array<{ element: HTMLElement | Window; event: string; handler: EventListener }> = [];

  constructor(config: EnvFlagConfig = {}) {
    this.config = { ...EnvFlag.DEFAULT_CONFIG, ...config };
    
    if (this.config.debug) {
      console.log('[EnvFlag] Initialized with config:', this.config);
    }
  }

  /**
   * Initialize the environment flag
   */
  public init(): void {
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
    } catch (error) {
      console.error('[EnvFlag] Failed to initialize:', error);
    }
  }

  /**
   * Destroy the environment flag and clean up resources
   */
  public destroy(): void {
    try {
      this.removeEventListeners();
      this.removeFlagElement();
      
      if (this.config.debug) {
        console.log('[EnvFlag] Flag destroyed and resources cleaned up');
      }
    } catch (error) {
      console.error('[EnvFlag] Error during cleanup:', error);
    }
  }

  /**
   * Update configuration and recreate flag
   */
  public updateConfig(newConfig: Partial<EnvFlagConfig>): void {
    Object.assign(this.config, newConfig);
    this.init();
  }

  /**
   * Get current environment
   */
  public getCurrentEnvironment(): Environment {
    if (this.config.forceEnv) {
      return this.config.forceEnv;
    }

    if (!this.config.autoDetectEnv) {
      return 'development';
    }

    return this.detectEnvironment();
  }

  private isValidEnvironment(): boolean {
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

  private detectEnvironment(): Environment {
    // Check various environment indicators
    const indicators = {
      hostname: window.location?.hostname || '',
      nodeEnv: (globalThis as any).process?.env?.NODE_ENV || '',
      userAgent: navigator?.userAgent || ''
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

  private createFlag(): void {
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

  private applyStyles(environment: Environment): void {
    if (!this.flagElement) return;

    const styles = this.getEnvironmentStyles(environment);
    const positionStyles = this.getPositionStyles();
    const sizeStyles = this.getSizeStyles();

    // Apply base styles
    Object.assign(this.flagElement.style, {
      // Content
      textContent: this.getEnvironmentText(environment),
      
      // Colors
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      
      // Typography
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      fontWeight: '600',
      fontSize: sizeStyles.fontSize,
      lineHeight: '1',
      textAlign: 'center' as const,
      
      // Layout
      position: 'fixed' as const,
      zIndex: EnvFlag.Z_INDEX,
      padding: sizeStyles.padding,
      
      // Visual
      borderRadius: positionStyles.borderRadius,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(8px)',
      opacity: styles.opacity,
      
      // Interaction
      cursor: 'pointer',
      userSelect: 'none' as const,
      transition: 'all 0.2s ease-in-out',
      
      // Positioning
      ...this.getPositionCoordinates(),
      
      // Accessibility
      outline: 'none'
    });

    this.flagElement.textContent = this.getEnvironmentText(environment);
  }

  private getEnvironmentStyles(environment: Environment): EnvFlagStyles {
    const colorMap: Record<Environment, string> = {
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

  private getEnvironmentText(environment: Environment): string {
    const textMap: Record<Environment, string> = {
      production: this.config.productionText,
      development: this.config.developmentText,
      staging: this.config.stagingText,
      test: this.config.testText
    };

    return textMap[environment];
  }

  private getSizeStyles(): { fontSize: string; padding: string } {
    const sizeMap = {
      small: { fontSize: '10px', padding: '4px 8px' },
      medium: { fontSize: '12px', padding: '6px 12px' },
      large: { fontSize: '14px', padding: '8px 16px' }
    };

    return sizeMap[this.config.size];
  }

  private getPositionStyles(): { borderRadius: string } {
    const radiusMap: Record<Position, string> = {
      'top-right': '0 0 0 4px',
      'top-left': '0 0 4px 0',
      'bottom-left': '0 4px 0 0',
      'bottom-right': '4px 0 0 0'
    };

    return { borderRadius: radiusMap[this.config.position] };
  }

  private getPositionCoordinates(): Record<string, string> {
    const coordinateMap: Record<Position, Record<string, string>> = {
      'top-right': { top: '0', right: '0' },
      'top-left': { top: '0', left: '0' },
      'bottom-left': { bottom: '0', left: '0' },
      'bottom-right': { bottom: '0', right: '0' }
    };

    return coordinateMap[this.config.position];
  }

  private attachEventListeners(): void {
    if (!this.flagElement) return;

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
    
    this.eventListeners.push(
      {
        element: this.flagElement,
        event: 'mouseenter',
        handler: mouseEnterHandler
      },
      {
        element: this.flagElement,
        event: 'mouseleave',
        handler: mouseLeaveHandler
      }
    );

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

  private handleClick(): void {
    this.destroy();
  }

  private handleMouseEnter(): void {
    if (this.flagElement) {
      this.flagElement.style.opacity = '1';
      this.flagElement.style.transform = 'scale(1.05)';
    }
  }

  private handleMouseLeave(): void {
    if (this.flagElement) {
      this.flagElement.style.opacity = '0.9';
      this.flagElement.style.transform = 'scale(1)';
    }
  }

  private handleKeydown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      this.destroy();
    }
  }

  private removeEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  private removeFlagElement(): void {
    if (this.flagElement && document.body?.contains(this.flagElement)) {
      document.body.removeChild(this.flagElement);
      this.flagElement = null;
    }
  }
}

// Auto-initialization for immediate testing
if (typeof window !== 'undefined') {
  const autoEnvFlag = new EnvFlag({
    debug: true // Enable debug mode for testing
  });
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoEnvFlag.init());
  } else {
    // DOM is already ready
    autoEnvFlag.init();
  }
}

export default EnvFlag;
export type { EnvFlagConfig, Environment, Position, Size };