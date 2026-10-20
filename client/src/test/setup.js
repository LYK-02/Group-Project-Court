import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mock for fetch
global.fetch = vi.fn();
