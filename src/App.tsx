import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, MainTab } from './components/Navigation';
import { HomeFeedMarketplace } from './components/HomeFeedMarketplace';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { SearchModal } from './components/SearchModal';
import {
  Product,
  NigerianCity,
  CartItem,
  DirectMessageThread,
  UserAccount,
  FeedPost,
} from './types';
import {
  SAMPLE_5_PRODUCTS,
  INITIAL_POSTS_DATA,
  INITIAL_USERS_DATA,
  subscribeToProducts,
  subscribeToUsers,
  subscribeToPosts,
  subscribeToChats,
  saveProductToFirestore,
  saveMessageToChatInFirestore,
  OrderDocument,
  GiftDocument,
} from './lib/firebaseService';

export default function App() {
  // Auth state - persists in localStorage
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('ago_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [selectedCity, setSelectedCity] = useState<NigerianCity>('All Nigeria');

  // Firestore real-time state
  const [products, setProducts] = useState<Product[]>(SAMPLE_5_PRODUCTS);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(INITIAL_POSTS_DATA);
  const [directThreads, setDirectThreads] = useState<DirectMessageThread[]>([]);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS_DATA);

  // Modals & Drawers state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Chat Triggering State
  const [pendingAiPrompt, setPendingAiPrompt] = useState<string>('');
  const [activeSellerThreadId, setActiveSellerThreadId] = useState<string | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => {
      setAdminToast((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Sync real-time data from Firestore
  useEffect(() => {
    // 1. Subscribe to Products
    const unsubProducts = subscribeToProducts((liveProds) => {
      setProducts(liveProds);
    });

    // 2. Subscribe to Users
    const unsubUsers = subscribeToUsers((liveUsers) => {
      setUsers(liveUsers);
    });

    // 3. Subscribe to Posts
    const unsubPosts = subscribeToPosts((livePosts) => {
      setFeedPosts(livePosts);
    });

    // 4. Subscribe to Chats
    const unsubChats = subscribeToChats((liveChats) => {
      setDirectThreads(liveChats);
    });

    return () => {
      unsubProducts();
      unsubUsers();
      unsubPosts();
      unsubChats();
    };
  }, []);

  // Save product to Firestore and local state
  const handleAddScrapedProduct = async (newProd: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === newProd.id);
      if (exists) return prev.map((p) => (p.id === newProd.id ? newProd : p));
      return [newProd, ...prev];
    });

    await saveProductToFirestore(newProd);
  };

  // Trigger Firecrawl auto-sync
  const handleSyncFirecrawl = async () => {
    try {
      const res = await fetch('/api/firecrawl/sync-trending', { method: 'POST' });
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        for (const p of data.products) {
          await saveProductToFirestore(p);
        }
      }
    } catch (e) {
      console.warn('Firecrawl auto-sync error:', e);
    }
  };

  // Admin User Management Handlers
  const handleUpdateUserStatus = (userId: string, status: 'active' | 'banned', reason?: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = {
            ...u,
            status,
            banReason: status === 'banned' ? reason || 'Policy Violation' : undefined,
            banDate: status === 'banned' ? new Date().toLocaleDateString() : undefined,
          };
          return updated;
        }
        return u;
      })
    );

    const targetUser = users.find((u) => u.id === userId);
    const userName = targetUser ? targetUser.handle : 'User';
    showToast(status === 'banned' ? `🚨 Banned account ${userName}` : `✅ Restored account ${userName}`);
  };

  const handleToggleUserVerification = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, verified: !u.verified };
          showToast(updated.verified ? `🎖️ Verified merchant ${u.handle}` : `Revoked verification for ${u.handle}`);
          return updated;
        }
        return u;
      })
    );
  };

  const handleAddUser = (newUserData: Omit<UserAccount, 'id'>) => {
    const newUser: UserAccount = {
      ...newUserData,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`🎉 Added new account ${newUser.handle}`);
  };

  // Handler: Add to cart
  const handleAddToCart = (product: Product, selectedSize?: string, selectedColor?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize, selectedColor }];
    });
  };

  // Handler: Update cart quantity
  const handleUpdateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(productId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: qty } : item
        )
      );
    }
  };

  // Handler: Remove from cart
  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Handler: Instant Buy Now
  const handleBuyNow = (product: Product, _selectedSize?: string, _selectedColor?: string) => {
    setSelectedProduct(null);
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Handler: Chat with Seller (Creates or retrieves Firestore chat)
  const handleChatSeller = async (product: Product) => {
    setSelectedProduct(null);
    const sellerId = product.seller.id;

    // Check if thread exists or create new
    const existingThread = directThreads.find((t) => t.seller.id === sellerId);
    let targetThreadId = '';

    if (existingThread) {
      targetThreadId = existingThread.id;
    } else {
      const newThread: DirectMessageThread = {
        id: `thread-${Date.now()}`,
        seller: {
          id: product.seller.id,
          name: product.seller.name,
          handle: product.seller.handle,
          avatar: product.seller.avatar,
          verified: product.seller.verified,
          city: product.seller.city,
          online: true,
        },
        lastMessage: `Inquiry about ${product.title}`,
        lastMessageTime: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: `Hi! Is the ${product.title} (${product.priceFormatted}) in ${product.city} still available?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            productContext: {
              title: product.title,
              priceFormatted: product.priceFormatted,
              image: product.image,
            },
          },
          {
            id: `msg-rep-${Date.now()}`,
            sender: 'seller',
            text: `Hello chief! Yes, the ${product.title} is available in our ${product.city} inventory with full escrow buyer protection! Would you like doorstep delivery?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };

      setDirectThreads((prev) => [newThread, ...prev]);
      targetThreadId = newThread.id;

      // Save to Firestore "chats" collection
      await saveMessageToChatInFirestore(newThread);
    }

    setActiveSellerThreadId(targetThreadId);
    setCurrentTab('chat');
  };

  // Handler: Ask AGO AI with pre-filled prompt
  const handleOpenAiChatWithPrompt = (prompt: string) => {
    setPendingAiPrompt(prompt);
    setActiveSellerThreadId(null);
    setCurrentTab('chat');
  };

  // Handler: Send message in seller thread and sync to Firestore
  const handleSendMessageToSeller = (threadId: string, text: string) => {
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let updatedThread: DirectMessageThread | null = null;

    setDirectThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          const updated = {
            ...thread,
            lastMessage: text,
            lastMessageTime: 'Just now',
            messages: [...thread.messages, userMsg],
          };
          updatedThread = updated;
          return updated;
        }
        return thread;
      })
    );

    if (updatedThread) {
      saveMessageToChatInFirestore(updatedThread);
    }

    // Realistic automated response from seller
    setTimeout(() => {
      const sellerReply = {
        id: `seller-rep-${Date.now()}`,
        sender: 'seller' as const,
        text: `Thanks for messaging! We've received your note regarding "${text.slice(0, 30)}...". Our logistics officer will coordinate inspection & swift delivery anywhere in ${
          selectedCity !== 'All Nigeria' ? selectedCity : 'Nigeria'
        }!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setDirectThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === threadId) {
            const finalThread = {
              ...thread,
              lastMessage: sellerReply.text,
              lastMessageTime: 'Just now',
              messages: [...thread.messages, sellerReply],
            };
            saveMessageToChatInFirestore(finalThread);
            return finalThread;
          }
          return thread;
        })
      );
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('ago_auth_user');
    setCurrentUser(null);
    showToast('Signed out of AGO Super App');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // If not authenticated via Phone OTP, force PhoneAuthModal
  if (!currentUser) {
    return <PhoneAuthModal onAuthenticated={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Sticky Header */}
      <Header
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAiChat={() => {
          setActiveSellerThreadId(null);
          setCurrentTab('chat');
        }}
        onOpenAdminPanel={() => setIsAdminOpen(true)}
      />

      {/* Admin Notification Toast */}
      {adminToast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce bg-slate-900 border border-teal-500/50 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2">
          <span>{adminToast}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeFeedMarketplace
            products={products}
            feedPosts={feedPosts}
            selectedCity={selectedCity}
            onSelectProduct={setSelectedProduct}
            onChatSeller={handleChatSeller}
            onBuyNow={handleBuyNow}
            onOpenAiChatWithPrompt={handleOpenAiChatWithPrompt}
            onOpenCreatorProfile={(_handle) => setCurrentTab('profile')}
            onAddScrapedProduct={handleAddScrapedProduct}
            onSyncFirecrawl={handleSyncFirecrawl}
          />
        )}

        {currentTab === 'chat' && (
          <ChatView
            initialPrompt={pendingAiPrompt}
            onClearInitialPrompt={() => setPendingAiPrompt('')}
            onSelectProduct={setSelectedProduct}
            onBuyNow={handleBuyNow}
            onOpenCreatorProfile={(_handle) => setCurrentTab('profile')}
            activeSellerThreadId={activeSellerThreadId}
            onCloseSellerThread={() => setActiveSellerThreadId(null)}
            directThreads={directThreads}
            onSendMessageToSeller={handleSendMessageToSeller}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            products={products}
            currentUser={currentUser}
            onSelectProduct={setSelectedProduct}
            onChatWithBrand={(_brand) => {
              const agoProduct = products.find((p) => p.seller.handle === '@AGO_Brand');
              if (agoProduct) {
                handleChatSeller(agoProduct);
              }
            }}
            onBuyNow={handleBuyNow}
            onOpenAdminPanel={() => setIsAdminOpen(true)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Search Modal across Firestore products, users, and posts */}
      {isSearchOpen && (
        <SearchModal
          products={products}
          users={users}
          posts={feedPosts}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(prod) => {
            setSelectedProduct(prod);
          }}
          onSelectUser={(_handle) => {
            setCurrentTab('profile');
          }}
          onSelectPost={(_post) => {
            setCurrentTab('home');
          }}
        />
      )}

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <AdminPanel
          users={users}
          onUpdateUserStatus={handleUpdateUserStatus}
          onToggleUserVerification={handleToggleUserVerification}
          onAddUser={handleAddUser}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onChatSeller={handleChatSeller}
          onAskAiAboutProduct={(prod) => {
            setSelectedProduct(null);
            handleOpenAiChatWithPrompt(
              `Is the price ${prod.priceFormatted} fair for ${prod.title} in ${prod.city}?`
            );
          }}
          onOpenCreatorProfile={(_handle) => {
            setSelectedProduct(null);
            setCurrentTab('profile');
          }}
        />
      )}

      {/* 3-Step Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          product={checkoutProduct}
          items={checkoutProduct ? undefined : cart}
          onClose={() => {
            setIsCheckoutOpen(false);
            setCheckoutProduct(null);
          }}
          onOrderCompleted={() => {
            if (!checkoutProduct) {
              setCart([]);
            }
          }}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setCheckoutProduct(null);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadCount={directThreads.filter((t) => t.unreadCount > 0).length}
      />
    </div>
  );
}
