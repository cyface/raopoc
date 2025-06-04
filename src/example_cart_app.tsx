// Example usage and deployment configuration
import React from "react";
import {
    Button,
    container,
    ProductCard,
    responsiveGrid, ShoppingCart,
    ThemeProvider,
    themeTokens,
    Product,
    CartItem
} from "./ecommerce_component_system.tsx";

export const App: React.FC = () => {
    const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = React.useState(false);

    // This would come from environment variables in real deployment
    const deploymentTheme = process.env.REACT_APP_THEME as 'default' | 'dark' | 'luxury' || 'default';

    const sampleProducts: Product[] = [
        {
            id: '1',
            name: 'Premium Headphones',
            price: 299.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
            description: 'High-quality wireless headphones with noise cancellation.',
            badge: 'Best Seller'
        },
        {
            id: '2',
            name: 'Smart Watch',
            price: 399.99,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
            description: 'Feature-rich smartwatch with health monitoring.'
        },
        {
            id: '3',
            name: 'Wireless Speaker',
            price: 149.99,
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop',
            description: 'Portable Bluetooth speaker with amazing sound quality.'
        },
    ];

    const handleAddToCart = (product: Product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? {...item, quantity: item.quantity + 1}
                        : item
                );
            }
            return [...prev, {...product, quantity: 1}];
        });
    };

    const handleUpdateQuantity = (id: string, quantity: number) => {
        if (quantity === 0) {
            handleRemoveItem(id);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? {...item, quantity} : item
            )
        );
    };

    const handleRemoveItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const handleCheckout = () => {
        alert('Proceeding to checkout...');
        setIsCartOpen(false);
    };

    return (
        <ThemeProvider theme={deploymentTheme}>
            <div style={{
                minHeight: '100vh',
                backgroundColor: themeTokens.colors.surface.background,
                fontFamily: themeTokens.typography.fontFamily.sans
            }}>
                {/* Header */}
                <header style={{
                    backgroundColor: themeTokens.colors.surface.card,
                    borderBottom: `1px solid ${themeTokens.colors.border.default}`,
                    padding: `${themeTokens.spacing.lg} 0`
                }}>
                    <div className={container}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h1 style={{
                                fontSize: themeTokens.typography.fontSize['2xl'],
                                fontWeight: themeTokens.typography.fontWeight.bold,
                                color: themeTokens.colors.text.primary
                            }}>
                                Enterprise Store
                            </h1>
                            <Button onClick={() => setIsCartOpen(true)}>
                                Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className={container}
                      style={{paddingTop: themeTokens.spacing['2xl'], paddingBottom: themeTokens.spacing['2xl']}}>
                    <h2 style={{
                        fontSize: themeTokens.typography.fontSize['3xl'],
                        fontWeight: themeTokens.typography.fontWeight.bold,
                        color: themeTokens.colors.text.primary,
                        marginBottom: themeTokens.spacing.xl,
                        textAlign: 'center'
                    }}>
                        Featured Products
                    </h2>

                    <div className={responsiveGrid}>
                        {sampleProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                </main>

                {/* Shopping Cart */}
                <ShoppingCart
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    items={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleCheckout}
                />
            </div>
        </ThemeProvider>
    );
};

export default App;