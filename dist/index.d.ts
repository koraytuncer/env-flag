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
declare class EnvFlag {
    private static readonly DEFAULT_CONFIG;
    private static readonly ELEMENT_ID;
    private static readonly Z_INDEX;
    private readonly config;
    private flagElement;
    private eventListeners;
    constructor(config?: EnvFlagConfig);
    /**
     * Initialize the environment flag
     */
    init(): void;
    /**
     * Destroy the environment flag and clean up resources
     */
    destroy(): void;
    /**
     * Update configuration and recreate flag
     */
    updateConfig(newConfig: Partial<EnvFlagConfig>): void;
    /**
     * Get current environment
     */
    getCurrentEnvironment(): Environment;
    private isValidEnvironment;
    private detectEnvironment;
    private createFlag;
    private applyStyles;
    private getEnvironmentStyles;
    private getEnvironmentText;
    private getSizeStyles;
    private getPositionStyles;
    private getPositionCoordinates;
    private attachEventListeners;
    private handleClick;
    private handleMouseEnter;
    private handleMouseLeave;
    private handleKeydown;
    private removeEventListeners;
    private removeFlagElement;
}
export default EnvFlag;
export type { EnvFlagConfig, Environment, Position, Size };
