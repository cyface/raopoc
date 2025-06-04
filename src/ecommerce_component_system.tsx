// themes.css.ts - Theme system with deployment variations
import { createTheme, createThemeContract } from '@vanilla-extract/css';

// Theme contract - defines the shape of all themes
export const themeTokens = createThemeContract({
  colors: {
    brand: {
      primary: null,
      secondary: null,
      accent: null,
    },
    neutral: {
      50: null,
      100: null,
      200: null,
      300: null,
      400: null,
      500: null,
      600: null,
      700: null,
      800: null,
      900: null,
    },
    semantic: {
      success: null,
      warning: null,
      error: null,
      info: null,
    },
    surface: {
      background: null,
      card: null,
      overlay: null,
    },
    text: {
      primary: null,
      secondary: null,
      muted: null,
      inverse: null,
    },
    border: {
      default: null,
      subtle: null,
      strong: null,
    }
  },
  spacing: {
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
    '2xl': null,
  },
  borderRadius: {
    sm: null,
    md: null,
    lg: null,
    full: null,
  },
  shadows: {
    sm: null,
    md: null,
    lg: null,
    xl: null,
  },
  typography: {
    fontFamily: {
      sans: null,
      mono: null,
    },
    fontSize: {
      xs: null,
      sm: null,
      base: null,
      lg: null,
      xl: null,
      '2xl': null,
      '3xl': null,
    },
    fontWeight: {
      normal: null,
      medium: null,
      semibold: null,
      bold: null,
    },
  }
});

// Default theme
export const defaultTheme = createTheme(themeTokens, {
  colors: {
    brand: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    surface: {
      background: '#ffffff',
      card: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      muted: '#9ca3af',
      inverse: '#ffffff',
    },
    border: {
      default: '#e5e7eb',
      subtle: '#f3f4f6',
      strong: '#d1d5db',
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  }
});

// Dark theme
export const darkTheme = createTheme(themeTokens, {
  colors: {
    brand: {
      primary: '#60a5fa',
      secondary: '#818cf8',
      accent: '#a78bfa',
    },
    neutral: {
      50: '#111827',
      100: '#1f2937',
      200: '#374151',
      300: '#4b5563',
      400: '#6b7280',
      500: '#9ca3af',
      600: '#d1d5db',
      700: '#e5e7eb',
      800: '#f3f4f6',
      900: '#f9fafb',
    },
    semantic: {
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
    surface: {
      background: '#111827',
      card: '#1f2937',
      overlay: 'rgba(0, 0, 0, 0.75)',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      muted: '#9ca3af',
      inverse: '#111827',
    },
    border: {
      default: '#374151',
      subtle: '#1f2937',
      strong: '#4b5563',
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.25), 0 2px 4px -2px rgb(0 0 0 / 0.25)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.15)',
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  }
});

// Luxury deployment theme (example of deployment-specific theming)
export const luxuryTheme = createTheme(themeTokens, {
  colors: {
    brand: {
      primary: '#d4af37', // Gold
      secondary: '#1a1a1a', // Rich black
      accent: '#c9a96e', // Champagne gold
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    semantic: {
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#d4af37',
    },
    surface: {
      background: '#fafafa',
      card: '#ffffff',
      overlay: 'rgba(26, 26, 26, 0.8)',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#525252',
      muted: '#737373',
      inverse: '#fafafa',
    },
    border: {
      default: '#d4af37',
      subtle: '#e5e5e5',
      strong: '#c9a96e',
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.125rem', // More angular for luxury feel
    md: '0.25rem',
    lg: '0.375rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px 0 rgb(212 175 55 / 0.1)',
    md: '0 4px 6px -1px rgb(212 175 55 / 0.1), 0 2px 4px -2px rgb(212 175 55 / 0.1)',
    lg: '0 10px 15px -3px rgb(212 175 55 / 0.1), 0 4px 6px -4px rgb(212 175 55 / 0.1)',
    xl: '0 20px 25px -5px rgb(212 175 55 / 0.1), 0 8px 10px -6px rgb(212 175 55 / 0.1)',
  },
  typography: {
    fontFamily: {
      sans: 'Playfair Display, Georgia, serif', // Luxury serif font
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  }
});

// =============================================================================
// Component Styles
// =============================================================================

import { style, styleVariants } from '@vanilla-extract/css';

// Button component styles
export const buttonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: themeTokens.spacing.sm,
  paddingLeft: themeTokens.spacing.lg,
  paddingRight: themeTokens.spacing.lg,
  paddingTop: themeTokens.spacing.sm,
  paddingBottom: themeTokens.spacing.sm,
  borderRadius: themeTokens.borderRadius.md,
  fontSize: themeTokens.typography.fontSize.base,
  fontWeight: themeTokens.typography.fontWeight.medium,
  fontFamily: themeTokens.typography.fontFamily.sans,
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  textDecoration: 'none',
  
  ':focus': {
    outline: 'none',
    boxShadow: `0 0 0 3px ${themeTokens.colors.brand.primary}33`,
  },
  
  ':disabled': {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
});

export const buttonVariants = styleVariants({
  primary: {
    backgroundColor: themeTokens.colors.brand.primary,
    color: themeTokens.colors.text.inverse,
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: themeTokens.shadows.md,
    },
  },
  secondary: {
    backgroundColor: 'transparent',
    color: themeTokens.colors.brand.primary,
    borderColor: themeTokens.colors.brand.primary,
    ':hover': {
      backgroundColor: themeTokens.colors.brand.primary,
      color: themeTokens.colors.text.inverse,
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: themeTokens.colors.text.primary,
    ':hover': {
      backgroundColor: themeTokens.colors.neutral[100],
    },
  },
});

export const buttonSizes = styleVariants({
  sm: {
    paddingLeft: themeTokens.spacing.md,
    paddingRight: themeTokens.spacing.md,
    paddingTop: themeTokens.spacing.xs,
    paddingBottom: themeTokens.spacing.xs,
    fontSize: themeTokens.typography.fontSize.sm,
  },
  md: {
    paddingLeft: themeTokens.spacing.lg,
    paddingRight: themeTokens.spacing.lg,
    paddingTop: themeTokens.spacing.sm,
    paddingBottom: themeTokens.spacing.sm,
    fontSize: themeTokens.typography.fontSize.base,
  },
  lg: {
    paddingLeft: themeTokens.spacing.xl,
    paddingRight: themeTokens.spacing.xl,
    paddingTop: themeTokens.spacing.md,
    paddingBottom: themeTokens.spacing.md,
    fontSize: themeTokens.typography.fontSize.lg,
  },
});

// Card component styles
export const cardBase = style({
  backgroundColor: themeTokens.colors.surface.card,
  borderRadius: themeTokens.borderRadius.lg,
  border: `1px solid ${themeTokens.colors.border.default}`,
  boxShadow: themeTokens.shadows.sm,
  overflow: 'hidden',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

export const cardHoverable = style({
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: themeTokens.shadows.lg,
  },
});

// Input component styles
export const inputBase = style({
  width: '100%',
  padding: themeTokens.spacing.sm,
  borderRadius: themeTokens.borderRadius.md,
  border: `1px solid ${themeTokens.colors.border.default}`,
  backgroundColor: themeTokens.colors.surface.background,
  color: themeTokens.colors.text.primary,
  fontSize: themeTokens.typography.fontSize.base,
  fontFamily: themeTokens.typography.fontFamily.sans,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  
  ':focus': {
    outline: 'none',
    borderColor: themeTokens.colors.brand.primary,
    boxShadow: `0 0 0 3px ${themeTokens.colors.brand.primary}33`,
  },
  
  '::placeholder': {
    color: themeTokens.colors.text.muted,
  },
});

// Badge component styles
export const badgeBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingLeft: themeTokens.spacing.sm,
  paddingRight: themeTokens.spacing.sm,
  paddingTop: '0.125rem',
  paddingBottom: '0.125rem',
  borderRadius: themeTokens.borderRadius.full,
  fontSize: themeTokens.typography.fontSize.xs,
  fontWeight: themeTokens.typography.fontWeight.medium,
  fontFamily: themeTokens.typography.fontFamily.sans,
});

export const badgeVariants = styleVariants({
  primary: {
    backgroundColor: themeTokens.colors.brand.primary,
    color: themeTokens.colors.text.inverse,
  },
  success: {
    backgroundColor: themeTokens.colors.semantic.success,
    color: themeTokens.colors.text.inverse,
  },
  warning: {
    backgroundColor: themeTokens.colors.semantic.warning,
    color: themeTokens.colors.text.inverse,
  },
  error: {
    backgroundColor: themeTokens.colors.semantic.error,
    color: themeTokens.colors.text.inverse,
  },
  neutral: {
    backgroundColor: themeTokens.colors.neutral[200],
    color: themeTokens.colors.text.primary,
  },
});

// Shopping Cart Drawer styles
export const drawerOverlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: themeTokens.colors.surface.overlay,
  zIndex: 50,
});

export const drawerContent = style({
  position: 'fixed',
  right: 0,
  top: 0,
  height: '100vh',
  width: '400px',
  maxWidth: '90vw',
  backgroundColor: themeTokens.colors.surface.card,
  boxShadow: themeTokens.shadows.xl,
  display: 'flex',
  flexDirection: 'column',
});

export const drawerHeader = style({
  padding: themeTokens.spacing.lg,
  borderBottom: `1px solid ${themeTokens.colors.border.default}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const drawerBody = style({
  flex: 1,
  overflow: 'auto',
  padding: themeTokens.spacing.lg,
});

export const drawerFooter = style({
  padding: themeTokens.spacing.lg,
  borderTop: `1px solid ${themeTokens.colors.border.default}`,
  backgroundColor: themeTokens.colors.surface.background,
});

// Product Card styles
export const productCard = style([
  cardBase,
  cardHoverable,
  {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  }
]);

export const productImage = style({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
});

export const productContent = style({
  padding: themeTokens.spacing.lg,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

export const productTitle = style({
  fontSize: themeTokens.typography.fontSize.lg,
  fontWeight: themeTokens.typography.fontWeight.semibold,
  color: themeTokens.colors.text.primary,
  marginBottom: themeTokens.spacing.sm,
});

export const productPrice = style({
  fontSize: themeTokens.typography.fontSize.xl,
  fontWeight: themeTokens.typography.fontWeight.bold,
  color: themeTokens.colors.brand.primary,
  marginTop: 'auto',
  marginBottom: themeTokens.spacing.md,
});

// Form styles
export const formGroup = style({
  marginBottom: themeTokens.spacing.lg,
});

export const formLabel = style({
  display: 'block',
  fontSize: themeTokens.typography.fontSize.sm,
  fontWeight: themeTokens.typography.fontWeight.medium,
  color: themeTokens.colors.text.primary,
  marginBottom: themeTokens.spacing.xs,
});

export const formError = style({
  fontSize: themeTokens.typography.fontSize.sm,
  color: themeTokens.colors.semantic.error,
  marginTop: themeTokens.spacing.xs,
});

// Layout styles
export const container = style({
  maxWidth: '1200px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: themeTokens.spacing.lg,
  paddingRight: themeTokens.spacing.lg,
});

export const grid = styleVariants({
  1: { display: 'grid', gridTemplateColumns: '1fr', gap: themeTokens.spacing.lg },
  2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: themeTokens.spacing.lg },
  3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: themeTokens.spacing.lg },
  4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: themeTokens.spacing.lg },
});

// Responsive grid
export const responsiveGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: themeTokens.spacing.lg,
});

// =============================================================================
// React Components
// =============================================================================

// Button.tsx
import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        buttonBase,
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className={formGroup}>
      {label && (
        <label className={formLabel} htmlFor={props.id}>
          {label}
        </label>
      )}
      <input className={clsx(inputBase, className)} {...props} />
      {error && <div className={formError}>{error}</div>}
    </div>
  );
};

// Badge.tsx
interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  style,
}) => {
  return (
    <span className={clsx(badgeBase, badgeVariants[variant])} style={style}>
      {children}
    </span>
  );
};

// Card.tsx
interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className,
}) => {
  return (
    <div className={clsx(cardBase, hoverable && cardHoverable, className)}>
      {children}
    </div>
  );
};

// ProductCard.tsx
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  badge?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  return (
    <div className={productCard}>
      <img
        src={product.image}
        alt={product.name}
        className={productImage}
      />
      <div className={productContent}>
        {product.badge && (
          <Badge variant="primary" style={{ alignSelf: 'flex-start', marginBottom: themeTokens.spacing.sm }}>
            {product.badge}
          </Badge>
        )}
        <h3 className={productTitle}>{product.name}</h3>
        {product.description && (
          <p style={{ color: themeTokens.colors.text.secondary, fontSize: themeTokens.typography.fontSize.sm }}>
            {product.description}
          </p>
        )}
        <div className={productPrice}>${product.price.toFixed(2)}</div>
        <Button onClick={() => onAddToCart(product)}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

// ShoppingCart.tsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export interface CartItem extends Product {
  quantity: number;
}

export interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={drawerOverlay} />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transition-transform duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <div className={drawerContent}>
            <div className={drawerHeader}>
              <h2 style={{ fontSize: themeTokens.typography.fontSize.xl, fontWeight: themeTokens.typography.fontWeight.semibold }}>
                Shopping Cart ({items.length})
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>

            <div className={drawerBody}>
              {items.length === 0 ? (
                <p style={{ color: themeTokens.colors.text.secondary, textAlign: 'center', marginTop: themeTokens.spacing.xl }}>
                  Your cart is empty
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: themeTokens.spacing.lg }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: themeTokens.spacing.md, alignItems: 'center' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: themeTokens.borderRadius.md }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: themeTokens.typography.fontWeight.medium, marginBottom: themeTokens.spacing.xs }}>
                          {item.name}
                        </h4>
                        <p style={{ color: themeTokens.colors.text.secondary, fontSize: themeTokens.typography.fontSize.sm }}>
                          ${item.price.toFixed(2)}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: themeTokens.spacing.sm, marginTop: themeTokens.spacing.xs }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          >
                            −
                          </Button>
                          <span style={{ minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.id)}
                            style={{ marginLeft: 'auto', color: themeTokens.colors.semantic.error }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className={drawerFooter}>
                <div style={{ marginBottom: themeTokens.spacing.lg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: themeTokens.typography.fontSize.lg, fontWeight: themeTokens.typography.fontWeight.semibold }}>
                      Total: ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button onClick={onCheckout} style={{ width: '100%' }} size="lg">
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

// Theme Provider and deployment configuration
export const ThemeProvider: React.FC<{ 
  theme: 'default' | 'dark' | 'luxury',
  children: React.ReactNode 
}> = ({ theme, children }) => {
  const themeClass = {
    default: defaultTheme,
    dark: darkTheme,
    luxury: luxuryTheme,
  }[theme];

  return (
    <div className={themeClass}>
      {children}
    </div>
  );
};

