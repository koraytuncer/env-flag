/**
 * Environment Flag - A lightweight library to display environment indicators
 * @version 1.0.0
 */

// Type definitions for import.meta.env support
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly NODE_ENV?: string;
    readonly VITE_NODE_ENV?: string;
    readonly VITE_APP_NODE_ENV?: string;
    readonly VITE_APP_ENV?: string;
    readonly VITE_ENV?: string;
    readonly REACT_APP_NODE_ENV?: string;
    readonly REACT_APP_ENV?: string;
    readonly VUE_APP_NODE_ENV?: string;
    readonly VUE_APP_ENV?: string;
    // Allow any custom VITE_ prefixed environment variables
    readonly [key: string]: string | undefined;
  }
}

type Environment = "development" | "production" | "staging" | "test";
type Position = "top-right" | "top-left" | "bottom-right" | "bottom-left";
type Size = "small" | "medium" | "large";

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
  private static readonly DEFAULT_CONFIG: Required<
    Omit<EnvFlagConfig, "forceEnv">
  > = {
    productionColor: "#f8285a",
    developmentColor: "#17c653",
    stagingColor: "#f39c12",
    testColor: "#9b59b6",
    productionText: "PROD",
    developmentText: "DEV",
    stagingText: "STAGING",
    testText: "TEST",
    position: "bottom-right",
    size: "medium",
    autoDetectEnv: true,
    enabled: true,
    debug: false,
  };

  private static readonly ELEMENT_ID = "env-flag-indicator";
  private static readonly Z_INDEX = "999999";

  private readonly config: Required<Omit<EnvFlagConfig, "forceEnv">> &
    Pick<EnvFlagConfig, "forceEnv">;
  private flagElement: HTMLElement | null = null;
  private eventListeners: Array<{
    element: HTMLElement | Window;
    event: string;
    handler: EventListener;
  }> = [];

  constructor(config: EnvFlagConfig = {}) {
    this.config = { ...EnvFlag.DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the environment flag
   */
  public init = (): void => {
    if (!this.isValidEnvironment()) return;
    if (!this.config.enabled) return;

    this.destroy(); // Clean up any existing flag
    this.createFlag();
  };

  /**
   * Destroy the environment flag and clean up resources
   */
  public destroy = (): void => {
    this.removeEventListeners();
    this.removeFlagElement();
  };

  /**
   * Update configuration and recreate flag
   */
  public updateConfig = (newConfig: Partial<EnvFlagConfig>): void => {
    Object.assign(this.config, newConfig);
    this.init();
  };

  /**
   * Get current environment
   */
  public getCurrentEnvironment = (): Environment => {
    if (this.config.forceEnv) return this.config.forceEnv;
    if (!this.config.autoDetectEnv) return "development";
    return this.detectEnvironment();
  };

  private isValidEnvironment = (): boolean =>
    typeof window !== "undefined" && typeof document !== "undefined";

  private detectEnvironment = (): Environment => {
    const indicators = {
      hostname: window.location?.hostname || "",
      nodeEnv: this.getNodeEnv(),
      customEnv: this.getCustomEnv(),
      userAgent: navigator?.userAgent || "",
    };

    // Priority 1: Custom environment variable (highest priority)
    if (indicators.customEnv) return indicators.customEnv;

    // Priority 2: NODE_ENV from bundler
    if (indicators.nodeEnv) return indicators.nodeEnv;

    // Priority 3: Hostname-based detection
    // Production indicators
    if (
      indicators.hostname.includes("prod") ||
      (!indicators.hostname.includes("localhost") &&
        !indicators.hostname.includes("127.0.0.1") &&
        !indicators.hostname.includes("dev") &&
        !indicators.hostname.includes("staging") &&
        !indicators.hostname.includes("test") &&
        indicators.hostname.length > 0)
    )
      return "production";

    // Staging indicators
    if (
      indicators.hostname.includes("staging") ||
      indicators.hostname.includes("stage")
    )
      return "staging";

    // Test indicators
    if (indicators.hostname.includes("test")) return "test";

    return "development";
  };

  private getNodeEnv = (): Environment | "" => {
    // Vite environment (import.meta.env)
    if (typeof import.meta !== "undefined" && import.meta.env) {
      const viteEnv = import.meta.env.NODE_ENV || import.meta.env.VITE_NODE_ENV;
      if (viteEnv && this.isValidEnvironmentString(viteEnv)) {
        return viteEnv as Environment;
      }
    }

    // Webpack/traditional bundler environment (process.env)
    if (
      typeof globalThis !== "undefined" &&
      (globalThis as any).process?.env?.NODE_ENV
    ) {
      const nodeEnv = (globalThis as any).process.env.NODE_ENV;
      if (this.isValidEnvironmentString(nodeEnv)) return nodeEnv as Environment;
    }

    return "";
  };

  private getCustomEnv = (): Environment | "" => {
    const customEnvVars = [
      "VITE_APP_NODE_ENV",
      "VITE_APP_ENV", 
      "VITE_ENV",
      "REACT_APP_NODE_ENV",
      "REACT_APP_ENV",
      "VUE_APP_NODE_ENV",
      "VUE_APP_ENV",
    ];

    // Vite environment
    if (typeof import.meta !== "undefined" && import.meta.env) {
      for (const envVar of customEnvVars) {
        const value = (import.meta.env as any)[envVar];
        if (value && this.isValidEnvironmentString(value)) {
          if (this.config.debug) {
            console.log(`[EnvFlag] Found custom env variable ${envVar}:`, value);
          }
          return value as Environment;
        }
      }
    }

    // Webpack/traditional bundler environment
    if (typeof globalThis !== "undefined" && (globalThis as any).process?.env) {
      for (const envVar of customEnvVars) {
        const value = (globalThis as any).process.env[envVar];
        if (value && this.isValidEnvironmentString(value)) {
          if (this.config.debug) {
            console.log(`[EnvFlag] Found custom env variable ${envVar}:`, value);
          }
          return value as Environment;
        }
      }
    }

    return "";
  };

  private isValidEnvironmentString = (env: string): boolean =>
    ["development", "production", "staging", "test"].includes(
      env as Environment
    );

  private createFlag = (): void => {
    const environment = this.getCurrentEnvironment();

    this.flagElement = document.createElement("div");
    this.flagElement.id = EnvFlag.ELEMENT_ID;
    this.flagElement.setAttribute("data-env", environment);
    this.flagElement.setAttribute("role", "status");
    this.flagElement.setAttribute("aria-label", `Environment: ${environment}`);

    this.applyStyles(environment);
    this.attachEventListeners();

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      if (this.flagElement && document.body) {
        document.body.appendChild(this.flagElement);
      }
    });
  };

  private applyStyles = (environment: Environment): void => {
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
      fontWeight: "600",
      fontSize: sizeStyles.fontSize,
      lineHeight: "1",
      textAlign: "center" as const,

      // Layout
      position: "fixed" as const,
      zIndex: EnvFlag.Z_INDEX,
      padding: sizeStyles.padding,

      // Visual
      borderRadius: positionStyles.borderRadius,
      opacity: styles.opacity,

      // Interaction
      cursor: "pointer",
      userSelect: "none" as const,
      transition: "all 0.2s ease-in-out",

      // Positioning
      ...this.getPositionCoordinates(),

      // Accessibility
      outline: "none",
    });

    this.flagElement.textContent = this.getEnvironmentText(environment);
  };

  private getEnvironmentStyles = (environment: Environment): EnvFlagStyles => {
    const colorMap: Record<Environment, string> = {
      production: this.config.productionColor,
      development: this.config.developmentColor,
      staging: this.config.stagingColor,
      test: this.config.testColor,
    };

    return {
      backgroundColor: colorMap[environment],
      color: "#ffffff",
      fontSize: this.getSizeStyles().fontSize,
      padding: this.getSizeStyles().padding,
      borderRadius: this.getPositionStyles().borderRadius,
      opacity: "0.9",
    };
  };

  private getEnvironmentText = (environment: Environment): string =>
    ({
      production: this.config.productionText,
      development: this.config.developmentText,
      staging: this.config.stagingText,
      test: this.config.testText,
    }[environment]);

  private getSizeStyles = (): { fontSize: string; padding: string } =>
    ({
      small: { fontSize: "10px", padding: "4px 8px" },
      medium: { fontSize: "12px", padding: "6px 12px" },
      large: { fontSize: "14px", padding: "8px 16px" },
    }[this.config.size]);

  private getPositionStyles = (): { borderRadius: string } => ({
    borderRadius: {
      "top-right": "0 0 0 4px",
      "top-left": "0 0 4px 0",
      "bottom-left": "0 4px 0 0",
      "bottom-right": "4px 0 0 0",
    }[this.config.position],
  });

  private getPositionCoordinates = (): Record<string, string> =>
    ({
      "top-right": { top: "0", right: "0" },
      "top-left": { top: "0", left: "0" },
      "bottom-left": { bottom: "0", left: "0" },
      "bottom-right": { bottom: "0", right: "0" },
    }[this.config.position]);

  private attachEventListeners = (): void => {
    if (!this.flagElement) return;

    // Click to remove
    const clickHandler = this.handleClick.bind(this);
    this.flagElement.addEventListener("click", clickHandler);
    this.eventListeners.push({
      element: this.flagElement,
      event: "click",
      handler: clickHandler,
    });

    // Hover effects
    const mouseEnterHandler = this.handleMouseEnter.bind(this);
    const mouseLeaveHandler = this.handleMouseLeave.bind(this);

    this.flagElement.addEventListener("mouseenter", mouseEnterHandler);
    this.flagElement.addEventListener("mouseleave", mouseLeaveHandler);

    this.eventListeners.push(
      {
        element: this.flagElement,
        event: "mouseenter",
        handler: mouseEnterHandler,
      },
      {
        element: this.flagElement,
        event: "mouseleave",
        handler: mouseLeaveHandler,
      }
    );

    // Keyboard accessibility
    const keydownHandler = this.handleKeydown.bind(this);
    this.flagElement.addEventListener("keydown", keydownHandler);
    this.flagElement.setAttribute("tabindex", "0");

    this.eventListeners.push({
      element: this.flagElement,
      event: "keydown",
      handler: keydownHandler,
    });
  };

  private handleClick = (): void => this.destroy();

  private handleMouseEnter = (): void => {
    if (this.flagElement) {
      this.flagElement.style.opacity = "1";
      this.flagElement.style.transform = "scale(1.05)";
    }
  };

  private handleMouseLeave = (): void => {
    if (this.flagElement) {
      this.flagElement.style.opacity = "0.9";
      this.flagElement.style.transform = "scale(1)";
    }
  };

  private handleKeydown = (event: Event): void => {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
      keyboardEvent.preventDefault();
      this.destroy();
    }
  };

  private removeEventListeners = (): void => {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  };

  private removeFlagElement = (): void => {
    if (this.flagElement && document.body?.contains(this.flagElement)) {
      document.body.removeChild(this.flagElement);
      this.flagElement = null;
    }
  };
}

// Auto-initialization for immediate testing
if (typeof window !== "undefined") {
  const autoEnvFlag = new EnvFlag({
    debug: true, // Enable debug mode for testing
  });

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => autoEnvFlag.init());
  } else {
    // DOM is already ready
    autoEnvFlag.init();
  }
}

export default EnvFlag;
export type { EnvFlagConfig, Environment, Position, Size };
