// FraudGuard AI - React Application (State-Based Navigation)
const { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } = React;

// ==================== CONSTANTS ====================
const API_BASE_URL = "https://fraudguarde-ai.onrender.com";
const MAX_TRANSACTIONS = 10000;

// Transaction features configuration
const TRANSACTION_FEATURES = {
    numerical: [
        { name: 'Transaction Amount', key: 'transaction_amount', min: 0, max: 100000, step: 0.01, unit: '₹', tooltip: 'The monetary value of the transaction' },
        { name: 'Transaction Frequency', key: 'transaction_frequency', min: 0, max: 100, step: 1, tooltip: 'Number of transactions in recent period' },
        { name: 'Behavioral Biometrics', key: 'behavioral_biometrics', min: 0, max: 3, step: 0.1, tooltip: 'User behavior pattern score' },
        { name: 'Time Since Last Transaction', key: 'time_since_last_transaction', min: 0, max: 30, step: 0.1, unit: 'hours', tooltip: 'Hours since previous transaction' },
        { name: 'Social Trust Score', key: 'social_trust_score', min: 0, max: 100, step: 1, tooltip: 'User reputation score (0-100)' },
        { name: 'Account Age', key: 'account_age', min: 0, max: 5, step: 0.1, unit: 'years', tooltip: 'Age of the account in years' },
        { name: 'Normalized Transaction Amount', key: 'normalized_transaction_amount', min: 0, max: 1, step: 0.01, tooltip: 'Transaction amount normalized (0-1)' },
        { name: 'Transaction Context Anomalies', key: 'transaction_context_anomalies', min: 0, max: 3, step: 0.1, tooltip: 'Contextual anomaly score' },
        { name: 'Fraud Complaints Count', key: 'fraud_complaints_count', min: 0, max: 50, step: 1, tooltip: 'Number of fraud complaints' }
    ],
    binary: [
        { name: 'Recipient Blacklist Status', key: 'recipient_blacklist_status', tooltip: 'Is recipient on blacklist?' },
        { name: 'Device Fingerprinting', key: 'device_fingerprinting', tooltip: 'Device flagged as suspicious?' },
        { name: 'VPN or Proxy Usage', key: 'vpn_proxy_usage', tooltip: 'Using VPN or proxy?' },
        { name: 'High-Risk Transaction Times', key: 'high_risk_transaction_times', tooltip: 'Transaction at unusual time?' },
        { name: 'Past Fraudulent Behavior Flags', key: 'past_fraudulent_behavior', tooltip: 'History of fraudulent activity?' },
        { name: 'Location-Inconsistent Transactions', key: 'location_inconsistent', tooltip: 'Transaction from unusual location?' },
        { name: 'Merchant Category Mismatch', key: 'merchant_category_mismatch', tooltip: 'Merchant category unusual?' },
        { name: 'User Daily Limit Exceeded', key: 'user_daily_limit_exceeded', tooltip: 'Exceeded daily transaction limit?' },
        { name: 'Recent High-Value Transaction Flags', key: 'recent_high_value_flags', tooltip: 'Recent high-value transactions?' }
    ],
    categorical: [
        { name: 'Recipient Verification Status', key: 'recipient_verification_status', options: ['verified', 'recently_registered', 'suspicious'], tooltip: 'Verification status of recipient' },
        { name: 'Geo-Location Flags', key: 'geo_location_flags', options: ['normal', 'high-risk', 'unusual'], tooltip: 'Geographic risk level' }
    ]
};

// ==================== CONTEXTS ====================

// Auth Context
const AuthContext = createContext();

// Update the AuthProvider component with localStorage and specific credentials
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Check localStorage for saved user data on initial load
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(false);

    // Save user data to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = (email, password) => {
        // Check for specific credentials
        if (email === 'niranjans8@gmail.com' && password === 'admin@123') {
            const userData = {
                email,
                name: 'Admin User',
                loginTime: new Date().toISOString()
            };
            setUser(userData);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Update the LoginPage component to handle failed login
const LoginPageComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { login, user } = useAuth();
    const { setCurrentPage } = useNavigation();

    useEffect(() => {
        if (user) {
            setCurrentPage('dashboard');
        }
    }, [user, setCurrentPage]);

    const validate = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();
        
        if (Object.keys(newErrors).length === 0) {
            const loginSuccess = login(email, password);
            
            if (loginSuccess) {
                window.addToast('Login successful!', 'success');
                setCurrentPage('dashboard');
            } else {
                setErrors({
                    auth: 'Invalid email or password. Please use niranjans8@gmail.com and admin@123'
                });
                window.addToast('Login failed: Invalid credentials', 'error');
            }
        } else {
            setErrors(newErrors);
        }
    };

    // Update the JSX to show authentication error
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 fade-in">
                {/* ...existing header JSX... */}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border transition-colors bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                            placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border transition-colors bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {errors.auth && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{errors.auth}</span>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg btn-hover">
                        Sign In
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button onClick={handleGoogleLogin} className="mt-4 w-full flex items-center justify-center space-x-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold shadow-sm">
                        <span className="text-xl">🔐</span>
                        <span>Sign in with Google</span>
                    </button>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Use email: niranjans8@gmail.com and password: admin@123
                </p>
            </div>
        </div>
    );
};

const useAuth = () => useContext(AuthContext);

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => useContext(ThemeContext);

// Transaction Context
const TransactionContext = createContext();

// Find the TransactionProvider component (around line 150-200) and replace it with:

const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem("transactions");
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(false);
    const authContext = React.useContext(AuthContext);

    // 🚀 Load transactions from backend (if available)
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const email = authContext?.user?.email;
                const response = await axios.get(`${API_BASE_URL}/get_transactions`, {
                    params: { account_id: email || "local-user", limit: 50 },
                });
                if (response.data && Array.isArray(response.data)) {
                    setTransactions(response.data);
                    localStorage.setItem("transactions", JSON.stringify(response.data));
                    window.addToast?.("Loaded transactions from backend", "info");
                }
            } catch (err) {
                console.warn("Backend fetch failed, using local data:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [authContext?.user?.email]);

    const addTransaction = async (transaction) => {
        try {
            const newTransaction = {
                ...transaction,
                id: `txn-${Date.now()}`,
                timestamp: new Date().toISOString(),
            };

            // 🧠 Save to backend
            try {
                await axios.post(`${API_BASE_URL}/save_transaction`, {
                    id: newTransaction.id,
                    account_id: authContext?.user?.email || "local-user",
                    recipient_id: transaction.recipient_id || "recipient-unknown",
                    transaction_amount: transaction.transaction_amount,
                    prediction: transaction.prediction,
                    probability: transaction.probability,
                    fraud_score: transaction.fraud_score,
                    timestamp: newTransaction.timestamp,
                });
            } catch (backendErr) {
                console.warn("Backend unavailable, saving locally:", backendErr.message);
            }

            // 💾 Save to localStorage
            setTransactions((prev) => {
                const updated = [newTransaction, ...prev].slice(0, MAX_TRANSACTIONS);
                localStorage.setItem("transactions", JSON.stringify(updated));
                return updated;
            });

            window.addToast?.("Transaction saved successfully", "success");
            return newTransaction;
        } catch (err) {
            console.error("Save transaction failed:", err);
            window.addToast?.(err.message || "Failed to save transaction", "error");
        }
    };

    const clearTransactions = () => {
        setTransactions([]);
        localStorage.removeItem("transactions");
        window.addToast?.("All transactions cleared", "warning");
    };

    const stats = useMemo(() => {
        const total = transactions.length;
        const frauds = transactions.filter((t) => t.prediction === "Fraudulent").length;
        const legitimate = total - frauds;
        const accuracy = total ? ((legitimate / total) * 100).toFixed(1) : 0;
        return { total, frauds, legitimate, accuracy };
    }, [transactions]);

    return (
        <TransactionContext.Provider value={{ transactions, addTransaction, clearTransactions, stats, loading }}>
            {children}
        </TransactionContext.Provider>
    );
};



const useTransactions = () => useContext(TransactionContext);

// ==================== UTILITY COMPONENTS ====================

// Dice Icon Component
const DiceIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
        <circle cx="8" cy="8" r="1" fill="currentColor"/>
        <circle cx="16" cy="8" r="1" fill="currentColor"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
        <circle cx="8" cy="16" r="1" fill="currentColor"/>
        <circle cx="16" cy="16" r="1" fill="currentColor"/>
    </svg>
);

// Toast Notification
const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    return (
        <div className={`${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] fade-in`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                ✕
            </button>
        </div>
    );
};

// Toast Container
const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    // Expose addToast globally
    useEffect(() => {
        window.addToast = (message, type = 'info') => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, message, type }]);
        };
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

// Loading Spinner
const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// Protected Route equivalent for state-based navigation
const ProtectedPage = ({ children, pageName }) => {
    const { user, loading } = useAuth();
    const { setCurrentPage } = useNavigation();

    useEffect(() => {
        if (!loading && !user) {
            setCurrentPage('login');
        }
    }, [user, loading, setCurrentPage]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner />
            </div>
        );
    }

    return user ? children : null;
};

// ==================== NAVIGATION COMPONENTS ====================

// Simple Link component for state-based navigation
const NavLink = ({ to, children, className, onClick }) => {
    const { setCurrentPage } = useNavigation();
    
    const handleClick = (e) => {
        e.preventDefault();
        setCurrentPage(to);
        if (onClick) onClick();
    };
    
    return <a href="#" onClick={handleClick} className={className}>{children}</a>;
};

// Navigation Context
const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
    const [currentPage, setCurrentPage] = useState('home');
    
    return (
        <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>
            {children}
        </NavigationContext.Provider>
    );
};

const useNavigation = () => useContext(NavigationContext);

// Navbar
const Navbar = () => {
    const { user, logout } = useAuth();
    const { setCurrentPage } = useNavigation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setCurrentPage('login');
        window.addToast('Logged out successfully', 'success');
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <NavLink to="home" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">FG</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">FraudGuard AI</span>
                        </NavLink>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <NavLink to="home" className="text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">Home</NavLink>
                        {user && (
                            <>
                                <NavLink to="dashboard" className="text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">Dashboard</NavLink>
                                <NavLink to="transactions" className="text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">Transactions</NavLink>
                                <NavLink to="analytics" className="text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">Analytics</NavLink>
                            </>
                        )}
                        <NavLink to="about" className="text-gray-800 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">About</NavLink>

                        {/* Theme Toggle */}
                        {/* <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            {isDark ? '🌞' : '🌙'}
                        </button> */}

                        {user ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-800 dark:text-gray-300">{user.name}</span>
                                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Logout</button>
                            </div>
                        ) : (
                            <NavLink to="login" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Login</NavLink>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                            <div className="w-6 h-5 flex flex-col justify-between">
                                <span className="w-full h-0.5 bg-gray-600 dark:bg-gray-300"></span>
                                <span className="w-full h-0.5 bg-gray-600 dark:bg-gray-300"></span>
                                <span className="w-full h-0.5 bg-gray-600 dark:bg-gray-300"></span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <NavLink to="home" className="block px-3 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
                        {user && (
                            <>
                                <NavLink to="dashboard" className="block px-3 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
                                <NavLink to="transactions" className="block px-3 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>Transactions</NavLink>
                                <NavLink to="analytics" className="block px-3 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>Analytics</NavLink>
                            </>
                        )}
                        <NavLink to="about" className="block px-3 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>About</NavLink>
                        {/* <button onClick={toggleTheme} className="w-full text-left px-3 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                            {isDark ? '🌞 Light Mode' : '🌙 Dark Mode'}
                        </button> */}
                        {user && (
                            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Logout</button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

// ==================== PAGE COMPONENTS ====================

// Home Page
const HomePage = () => {
    const { user } = useAuth();
    const { setCurrentPage } = useNavigation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16 fade-in">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Protect Your Business from Fraud
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                        Advanced AI-powered fraud detection system using GAN + Random Forest machine learning to identify fraudulent transactions in real-time.
                    </p>
                    <div className="flex justify-center space-x-4">
                        {user ? (
                            <button onClick={() => setCurrentPage('dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg btn-hover">
                                Go to Dashboard
                            </button>
                        ) : (
                            <button onClick={() => setCurrentPage('login')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg btn-hover">
                                Get Started
                            </button>
                        )}
                        <button onClick={() => setCurrentPage('about')} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg border border-gray-300 dark:border-gray-600">
                            Learn More
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg card-hover">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Real-time Detection</h3>
                        <p className="text-gray-700 dark:text-gray-300">Analyze transactions instantly with sub-second response times using advanced machine learning models.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg card-hover">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">🤖</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI-Powered Analysis</h3>
                        <p className="text-gray-700 dark:text-gray-300">Leverage GAN + Random Forest hybrid model with 95.8% accuracy for superior fraud detection.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg card-hover">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">📊</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Comprehensive Reports</h3>
                        <p className="text-gray-700 dark:text-gray-300">Detailed analytics, visualizations, and actionable insights for informed decision making.</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Platform Statistics</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">15,847</div>
                            <div className="text-gray-700 dark:text-gray-300">Total Transactions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">1,247</div>
                            <div className="text-gray-700 dark:text-gray-300">Frauds Detected</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">95.8%</div>
                            <div className="text-gray-700 dark:text-gray-300">Accuracy Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">0.34s</div>
                            <div className="text-gray-700 dark:text-gray-300">Avg Response Time</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Login Page
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { login, user } = useAuth();
    const { setCurrentPage } = useNavigation();

    useEffect(() => {
        if (user) {
            setCurrentPage('dashboard');
        }
    }, [user, setCurrentPage]);

    const validate = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length === 0) {
            const success = login(email, password);
            if (success) {
                window.addToast('Login successful!', 'success');
                setCurrentPage('dashboard');
            } else {
                setErrors({ auth: 'Login failed — check mail/password' });
                window.addToast('Login failed — check mail/password', 'error');
            }
        } else {
            setErrors(newErrors);
        }
    };

    const handleGoogleLogin = () => {
        window.addToast('Google Sign-In requires Firebase setup. Using demo login instead.', 'info');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 fade-in">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-3xl">FG</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border transition-colors bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                            placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border transition-colors bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {errors.auth && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{errors.auth}</span>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg btn-hover">
                        Sign In
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button onClick={handleGoogleLogin} className="mt-4 w-full flex items-center justify-center space-x-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold shadow-sm">
                        <span className="text-xl">🔐</span>
                        <span>Sign in with Google</span>
                    </button>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Use email: niranjans8@gmail.com and password: admin@123
                </p>
            </div>
        </div>
    );
};

// Dashboard Page
const DashboardPage = () => {
    const { stats, addTransaction } = useTransactions();
    const { isDark } = useTheme();
    const { user } = React.useContext(AuthContext);
    const [formData, setFormData] = useState({});
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [formError, setFormError] = useState(null); // <-- MODIFICATION: Added state

    // Helper function to round based on step value
    const roundToStep = (value, step) => {
        if (step >= 1) {
            // For integers, round to whole number
            return Math.round(value);
        } else if (step === 0.1) {
            // For step 0.1, round to 1 decimal place
            return Math.round(value * 10) / 10;
        } else if (step === 0.01) {
            // For step 0.01, round to 2 decimal places
            return Math.round(value * 100) / 100;
        } else {
            // Default: 2 decimal places
            return Math.round(value * 100) / 100;
        }
    };

    // Initialize form data with default values
    useEffect(() => {
        const initialData = {};
        TRANSACTION_FEATURES.numerical.forEach(f => initialData[f.key] = 0);
        TRANSACTION_FEATURES.binary.forEach(f => initialData[f.key] = 0);
        TRANSACTION_FEATURES.categorical.forEach(f => initialData[f.key] = f.options[0]);
        setFormData(initialData);
    }, []);

    const handleInputChange = (key, value) => {
        setPrediction(null);
        setFormError(null); // <-- MODIFICATION: Clear error on input change
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const fillSampleData = (type) => {
        const randomFromAccount = generateAccountNumber();
        const randomToAccount = generateAccountNumber();
      
        const generateValue = (min, max, step = 1) => {
          const precision = step.toString().split(".")[1]?.length || 0;
          const randomVal = Math.random() * (max - min) + min;
          return parseFloat(randomVal.toFixed(precision));
        };
      
        // Start with full schema so all form fields exist
        const randomSample = {};
      
        TRANSACTION_FEATURES.numerical.forEach((f) => {
          if (type === "fraud") {
            randomSample[f.key] = generateValue(f.min, f.max * (Math.random() * 0.8 + 0.2), f.step);

          } else {
            randomSample[f.key] = generateValue(f.min, f.max * 0.5, f.step);
          }
        });
      
        TRANSACTION_FEATURES.binary.forEach((f) => {
          if (type === "fraud") {
            // 60–80% chance for risky flag = 1
            randomSample[f.key] = Math.random() < 0.7 ? 1 : 0;
          } else {
            // 10–20% chance for flag = 1
            randomSample[f.key] = Math.random() < 0.2 ? 1 : 0;
          }
        });
      
        TRANSACTION_FEATURES.categorical.forEach((f) => {
          if (type === "fraud") {
            // pick randomly from middle or high-risk options
            const opt = f.options[Math.floor(Math.random() * f.options.length)];
            randomSample[f.key] = opt;
          } else {
            // prefer the first (safe) option
            randomSample[f.key] = f.options[0];
          }
        });
      
        // Add your new From/To account fields
        randomSample["from_account"] = randomFromAccount;
        randomSample["to_account"] = randomToAccount;
      
        // Add transaction amount and context
        if (type === "fraud") {
          randomSample["transaction_amount"] = generateValue(2000, 8000, 0.01);
        } else {
          randomSample["transaction_amount"] = generateValue(50, 800, 0.01);
        }
      
        setFormData(randomSample);
        setPrediction(null);
        setFormError(null); // <-- MODIFICATION: Clear error
        setShowAlert(false);
        window.addToast?.(
          `Generated randomized ${type === "fraud" ? "FRAUD" : "LEGITIMATE"} sample`,
          type === "fraud" ? "warning" : "success"
        );
      };
      
    

    const clearForm = () => {
        const initialData = {};
        TRANSACTION_FEATURES.numerical.forEach(f => initialData[f.key] = 0);
        TRANSACTION_FEATURES.binary.forEach(f => initialData[f.key] = 0);
        TRANSACTION_FEATURES.categorical.forEach(f => initialData[f.key] = f.options[0]);
        setFormData(initialData);
        setPrediction(null);
        setFormError(null); // <-- MODIFICATION: Clear error
        setShowAlert(false);
        window.addToast('Form cleared', 'info');
    };
    // Helper function to generate realistic account numbers
    const generateAccountNumber = () => {
        // e.g. 16-digit number formatted like a real bank account
        const prefix = Math.floor(Math.random() * 9000 + 1000); // e.g. 4-digit branch code
        const body = Math.floor(Math.random() * 9_0000_0000_0000 + 1_0000_0000_0000); // 12–13 digits
        return `AC${prefix}${body}`; // e.g. AC4876123456789012
    };

    const generateRandomTransaction = () => {
        const isFraud = Math.random() > 0.5;
        const randomFromAccount = generateAccountNumber();
        const randomToAccount = generateAccountNumber();
    
        // ✅ Probability of amount spike (10–15%)
        const spikeChance = Math.random();
        let amountBase, transactionAmount;
    
        if (spikeChance < 0.1) {
            // Rare extreme spike
            amountBase = Math.random() * 500 + 5000; // e.g. ₹5000–₹5500
        } else if (spikeChance < 0.25) {
            // Mild spike
            amountBase = Math.random() * 800 + 1200; // e.g. ₹1200–₹2000
        } else {
            // Normal transaction
            amountBase = Math.random() * 500 + 100; // e.g. ₹100–₹600
        }
    
        // Add some variance and rounding
        transactionAmount = roundToStep(amountBase + Math.random() * 50, 0.01);
    
        if (isFraud) {
            // Generate realistic high-risk transaction
            const fraudData = {
                from_account: randomFromAccount,
                to_account: randomToAccount,
                transaction_amount: transactionAmount,
                transaction_frequency: Math.floor(Math.random() * 20) + 10,
                recipient_verification_status: ['suspicious', 'recently_registered'][Math.floor(Math.random() * 2)],
                recipient_blacklist_status: Math.random() > 0.3 ? 1 : 0,
                device_fingerprinting: Math.random() > 0.4 ? 1 : 0,
                vpn_proxy_usage: Math.random() > 0.3 ? 1 : 0,
                geo_location_flags: ['high-risk', 'unusual'][Math.floor(Math.random() * 2)],
                behavioral_biometrics: roundToStep(Math.random() * 1.5 + 1.5, 0.1),
                time_since_last_transaction: roundToStep(Math.random() * 2, 0.1),
                social_trust_score: Math.floor(Math.random() * 30),
                account_age: roundToStep(Math.random() * 1.5, 0.1),
                high_risk_transaction_times: Math.random() > 0.4 ? 1 : 0,
                past_fraudulent_behavior: Math.random() > 0.5 ? 1 : 0,
                location_inconsistent: Math.random() > 0.4 ? 1 : 0,
                normalized_transaction_amount: roundToStep(Math.random() * 0.4 + 0.6, 0.01),
                transaction_context_anomalies: roundToStep(Math.random() * 1.5 + 1.5, 0.1),
                fraud_complaints_count: Math.floor(Math.random() * 10),
                merchant_category_mismatch: Math.random() > 0.5 ? 1 : 0,
                user_daily_limit_exceeded: Math.random() > 0.5 ? 1 : 0,
                recent_high_value_flags: Math.random() > 0.4 ? 1 : 0
            };
            setFormData(fraudData);
            setPrediction(null);
            setFormError(null); // <-- MODIFICATION: Clear error
            setShowAlert(false);
            window.addToast('Generated random FRAUD transaction 🚨', 'warning');
        } else {
            // Generate realistic low-risk transaction
            const legitData = {
                from_account: randomFromAccount,
                to_account: randomToAccount,
                transaction_amount: transactionAmount,
                transaction_frequency: Math.floor(Math.random() * 5) + 1,
                recipient_verification_status: 'verified',
                recipient_blacklist_status: 0,
                device_fingerprinting: 0,
                vpn_proxy_usage: 0,
                geo_location_flags: 'normal',
                behavioral_biometrics: roundToStep(Math.random() * 1, 0.1),
                time_since_last_transaction: roundToStep(Math.random() * 20 + 5, 0.1),
                social_trust_score: Math.floor(Math.random() * 30 + 70),
                account_age: roundToStep(Math.random() * 3 + 2, 0.1),
                high_risk_transaction_times: 0,
                past_fraudulent_behavior: 0,
                location_inconsistent: 0,
                normalized_transaction_amount: roundToStep(Math.random() * 0.4, 0.01),
                transaction_context_anomalies: roundToStep(Math.random() * 0.5, 0.1),
                fraud_complaints_count: 0,
                merchant_category_mismatch: 0,
                user_daily_limit_exceeded: 0,
                recent_high_value_flags: 0
            };
            setFormData(legitData);
            setPrediction(null);
            setFormError(null); // <-- MODIFICATION: Clear error
            setShowAlert(false);
            window.addToast('Generated random LEGITIMATE transaction ✅', 'success');
        }
    };
    
    
    // <-- MODIFICATION: Replaced handleSubmit function -->
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous results/errors
        setLoading(true);
        setPrediction(null);
        setFormError(null);
        setShowAlert(false);

        // ✅ Enhanced Validation
        if (!formData.from_account || !formData.to_account) {
            setFormError("Both 'From Account' and 'To Account' are required.");
            window.addToast?.("Form is incomplete.", "error");
            setLoading(false); // Stop loading
            return;
        }

        if (!formData.transaction_amount || formData.transaction_amount <= 0) {
            setFormError("Invalid amount. Please enter a transaction amount greater than 0.");
            window.addToast?.("Invalid transaction amount.", "error");
            setLoading(false); // Stop loading
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' }
            });

            const result = response.data;
            setPrediction(result);

            if (result.probability > 0.8) {
                setShowAlert(true);
            }

            const transaction = await addTransaction({
                ...formData,
                prediction: result.prediction,
                probability: result.probability,
                fraud_score: result.fraud_score || 0
            });

            window.addToast('Analysis completed successfully', 'success');
            return transaction;
        } catch (error) {
            console.error('API Error:', error);
            window.addToast(
                error.response?.data?.error ||
                error.message ||
                'Server connection failed',
                'error'
            );
            // Optionally, set a server error message
            // setFormError("Failed to connect to analysis server.");
        } finally {
            setLoading(false);
        }
    };
    // <-- END OF MODIFICATION -->


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            
            {/* High Risk Alert */}
            {showAlert && (
                <div className="bg-red-500 text-white px-6 py-4 flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <div className="font-bold text-lg">HIGH RISK FRAUD DETECTED!</div>
                            <div className="text-sm">Fraud probability exceeds 80%. Immediate action recommended.</div>
                        </div>
                    </div>
                    <button onClick={() => setShowAlert(false)} className="text-white hover:text-gray-200">
                        ✕
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-400">Total Transactions</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-400">Frauds Detected</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.frauds}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🚨</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-400">Legitimate</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.legitimate}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-400">Accuracy</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.accuracy}%</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🎯</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Prediction Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transaction Analysis Form</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Transaction Details */}
                                <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Details</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* From Account */}
                                    <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        From Account (Sender)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.from_account || ""}
                                        onChange={(e) => handleInputChange("from_account", e.target.value)}
                                        placeholder="Enter sender account ID or email"
                                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                                        isDark
                                            ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                            : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400`}
                                    />
                                    </div>

                                    {/* To Account */}
                                    <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        To Account (Recipient)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.to_account || ""}
                                        onChange={(e) => handleInputChange("to_account", e.target.value)}
                                        placeholder="Enter recipient account ID or email"
                                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                                        isDark
                                            ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                            : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400`}
                                    />
                                    </div>
                                </div>
                                </div>

                                {/* Numerical Inputs */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Numerical Features</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {TRANSACTION_FEATURES.numerical.map(feature => (
                                            <div key={feature.key} className="tooltip">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {feature.name} {feature.unit && `(${feature.unit})`}
                                                </label>
                                                <input
                                                    type="number"
                                                    min={feature.min}
                                                    max={feature.max}
                                                    step={feature.step}
                                                    value={formData[feature.key] || 0}
                                                    onChange={(e) => handleInputChange(feature.key, parseFloat(e.target.value))}
                                                    placeholder={`Enter ${feature.name.toLowerCase()}`}
                                                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                                                        isDark 
                                                            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                                                            : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400`}
                                                />
                                                <span className="tooltip-text">{feature.tooltip}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Binary Inputs */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Binary Features</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {TRANSACTION_FEATURES.binary.map(feature => (
                                            <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg tooltip">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {feature.name}
                                                </label>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData[feature.key] === 1}
                                                        onChange={(e) => handleInputChange(feature.key, e.target.checked ? 1 : 0)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                                <span className="tooltip-text">{feature.tooltip}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Categorical Inputs */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categorical Features</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {TRANSACTION_FEATURES.categorical.map(feature => (
                                            <div key={feature.key} className="tooltip">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {feature.name}
                                                </label>
                                                <select
                                                    value={formData[feature.key] || feature.options[0]}
                                                    onChange={(e) => handleInputChange(feature.key, e.target.value)}
                                                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                                                        isDark 
                                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                                            : 'bg-white border-gray-300 text-gray-900'
                                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400`}
                                                >
                                                    {feature.options.map(option => (
                                                        <option 
                                                            key={option} 
                                                            value={option}
                                                            className={isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}
                                                        >
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="tooltip-text">{feature.tooltip}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed btn-hover"
                                    >
                                        {loading ? 'Analyzing...' : 'Analyze Transaction'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={generateRandomTransaction}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <DiceIcon className="w-5 h-5" />
                                        Random
                                    </button>
                                    {/* <button
                                        type="button"
                                        onClick={() => fillSampleData('fraud')}
                                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
                                    >
                                        Fraud Sample
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fillSampleData('legitimate')}
                                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                                    >
                                        Legit Sample
                                    </button> */}
                                    <button
                                        type="button"
                                        onClick={clearForm}
                                        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Result Display */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Prediction Result</h2>
                            
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <LoadingSpinner />
                                    <p className="text-gray-700 dark:text-gray-400 mt-4">Analyzing transaction...</p>
                                </div>
                            )}

                            {/* <-- MODIFICATION: Replaced conditional rendering logic --> */}
                            {!loading && !prediction && !formError && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <span className="text-6xl mb-4 block">🔍</span>
                                    <p className="text-gray-700 dark:text-gray-400">Fill the form and click "Analyze Transaction" to get results</p>
                                </div>
                            )}

                            {!loading && formError && (
                                <div className="flex flex-col items-center justify-center py-12 text-center fade-in">
                                    <span className="text-6xl mb-4 block">🚫</span>
                                    <p className="text-red-600 dark:text-red-400 font-semibold">{formError}</p>
                                </div>
                            )}

                            {!loading && prediction && (
                                <div className="space-y-6 fade-in">
                                    {/* Prediction Label */}
                                    <div className={`p-6 rounded-lg text-center ${
                                        prediction.prediction === 'Fraudulent' 
                                            ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500'
                                            : 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                                    }`}>
                                        <div className="text-4xl mb-2">
                                            {prediction.prediction === 'Fraudulent' ? '🚨' : '✅'}
                                        </div>
                                        <div className={`text-2xl font-bold ${
                                            prediction.prediction === 'Fraudulent' ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                                        }`}>
                                            {prediction.prediction.toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Probability */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fraud Probability</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{(prediction.probability * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                            <div
                                                className={`h-4 rounded-full progress-bar ${
                                                    prediction.probability > 0.8 ? 'bg-red-600' :
                                                    prediction.probability > 0.5 ? 'bg-yellow-600' : 'bg-green-600'
                                                }`}
                                                style={{ width: `${prediction.probability * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Fraud Score */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Score</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{prediction.fraud_score?.toFixed(1) || 'N/A'} / 10</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                            <div
                                                className="h-4 rounded-full bg-gradient-to-r from-yellow-400 to-red-600 progress-bar"
                                                style={{ width: `${(prediction.fraud_score || 0) * 10}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Risk Factors */}
                                    {prediction.risk_factors && prediction.risk_factors.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Risk Factors:</h3>
                                            <ul className="space-y-2">
                                                {prediction.risk_factors.map((factor, idx) => (
                                                    <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                                        <span className="text-red-500 mt-0.5">•</span>
                                                        <span>{factor}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center border-t dark:border-gray-700 pt-4">
                                        Analyzed at: {new Date().toLocaleString()}
                                    </div>
                                </div>
                            )}
                            {/* <-- END OF MODIFICATION --> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Transactions Page
const TransactionsPage = () => {
    const { transactions, clearTransactions } = useTransactions();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter and search
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = searchTerm === '' || 
            t.transaction_amount?.toString().includes(searchTerm) ||
            t.prediction?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterType === 'all' || 
            (filterType === 'fraud' && t.prediction === 'Fraudulent') ||
            (filterType === 'legit' && t.prediction === 'Legitimate');
        
        return matchesSearch && matchesFilter;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIdx, startIdx + itemsPerPage);

    // Export to CSV
    const exportToCSV = () => {
        if (transactions.length === 0) {
            window.addToast('No transactions to export', 'warning');
            return;
        }

        const headers = ['ID', 'Amount', 'Prediction', 'Probability', 'Fraud Score', 'Timestamp'];
        const rows = transactions.map(t => [
            t.id,
            t.transaction_amount,
            t.prediction,
            t.probability,
            t.fraud_score || 'N/A',
            new Date(t.timestamp).toLocaleString()
        ]);

        let csv = headers.join(',') + '\n';
        csv += rows.map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fraudguard_transactions_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        window.addToast('Transactions exported successfully', 'success');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Transaction History</h2>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={exportToCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center space-x-2">
                                <span>📥</span>
                                <span>Export CSV</span>
                            </button>
                            <button onClick={() => { if (confirm('Clear all transactions?')) clearTransactions(); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Search by amount or prediction..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Transactions</option>
                            <option value="fraud">Fraudulent Only</option>
                            <option value="legit">Legitimate Only</option>
                        </select>
                    </div>

                    {/* Table */}
                    {paginatedTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block">📭</span>
                            <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">Prediction</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">Probability</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">Risk Score</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedTransactions.map(transaction => (
                                            <tr key={transaction.id} className={transaction.prediction === 'Fraudulent' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-green-50 dark:bg-green-900/10'}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.id}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">₹{transaction.transaction_amount?.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        transaction.prediction === 'Fraudulent'
                                                            ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    }`}>
                                                        {transaction.prediction}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{(transaction.probability * 100).toFixed(1)}%</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.fraud_score?.toFixed(1) || 'N/A'}</td>
                 <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(transaction.timestamp).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-800 dark:text-gray-300">
                                        Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">{currentPage}</span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Analytics Page with Charts
const AnalyticsPage = () => {
    const { transactions, stats } = useTransactions();
    const pieChartRef = useRef(null);
    const barChartRef = useRef(null);
    const lineChartRef = useRef(null);
    const doughnutChartRef = useRef(null);

    useEffect(() => {
        // Pie Chart - Fraud vs Legitimate
        if (!pieChartRef.current) return;
        const ctx = pieChartRef.current.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Legitimate', 'Fraudulent'],
                datasets: [{
                    data: [stats.legitimate || 1, stats.frauds || 1],
                    backgroundColor: ['#10B981', '#EF4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Fraud vs Legitimate Distribution' }
                }
            }
        });
        return () => chart.destroy();
    }, [stats]);

    useEffect(() => {
        // Bar Chart - Risk Levels
        if (!barChartRef.current) return;
        const ctx = barChartRef.current.getContext('2d');

        const lowRisk = transactions.filter(t => (t.probability ?? 0) < 0.3).length;
        const mediumRisk = transactions.filter(t => (t.probability ?? 0) >= 0.3 && (t.probability ?? 0) < 0.6).length;
        const highRisk = transactions.filter(t => (t.probability ?? 0) >= 0.6 && (t.probability ?? 0) < 0.8).length;
        const criticalRisk = transactions.filter(t => (t.probability ?? 0) >= 0.8).length;

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Low', 'Medium', 'High', 'Critical'],
                datasets: [{
                    label: 'Transaction Count',
                    data: [lowRisk, mediumRisk, highRisk, criticalRisk],
                    backgroundColor: ['#10B981', '#F59E0B', '#F97316', '#EF4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Transaction Volume by Risk Level' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        return () => chart.destroy();
    }, [transactions]);

    useEffect(() => {
        // Line Chart - Transaction Trends
        if (!lineChartRef.current) return;
        const ctx = lineChartRef.current.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [
                    {
                        label: 'Fraudulent',
                        data: [12, 19, 8, 15, 10, 13, 9],
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Legitimate',
                        data: [65, 59, 80, 81, 56, 55, 70],
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Fraud Detection Over Time (Last 7 Days)' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        return () => chart.destroy();
    }, []);

    useEffect(() => {
        // Doughnut Chart - Top Risk Factors
        if (!doughnutChartRef.current) return;
        const ctx = doughnutChartRef.current.getContext('2d');

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['VPN Usage', 'Blacklist', 'New Account', 'High Amount', 'Location'],
                datasets: [{
                    data: [450, 380, 320, 290, 210],
                    backgroundColor: ['#EF4444', '#F97316', '#F59E0B', '#FBBF24', '#FCD34D']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Top Risk Factors' }
                }
            }
        });

        return () => chart.destroy();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Analytics Dashboard</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="chart-container">
                            <canvas ref={pieChartRef}></canvas>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="chart-container">
                            <canvas ref={barChartRef}></canvas>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="chart-container">
                            <canvas ref={lineChartRef}></canvas>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="chart-container">
                            <canvas ref={doughnutChartRef}></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// About Page
const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">About FraudGuard AI</h1>
                    
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-800 dark:text-gray-300 mb-6">
                            FraudGuard AI is an advanced fraud detection system powered by cutting-edge machine learning technology. 
                            Our system combines a <strong>Graph Attention Network (GAT)</strong> for relational analysis with a <strong>Random Forest</strong> algorithm to provide highly accurate fraud detection in real-time.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">How It Works</h2>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                1. Feature-Level Analysis (Random Forest)
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-800 dark:text-gray-300">
                                <li>
                                    <strong>20+ Features Analyzed:</strong> Our Random Forest model classifies individual transactions by analyzing 20+ features like amount, frequency, device, and location.
                                </li>
                                <li>
                                    <strong>Real-time Analysis:</strong> This feature-based check provides sub-second prediction times with 95.8% accuracy.
                                </li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                2. Relational Analysis (Graph Attention Network)
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-800 dark:text-gray-300">
                                <li>
                                    <strong>Graph-Based Detection:</strong> We model all users and transactions as a large, interconnected graph.
                                </li>
                                <li>
                                    <strong>Graph Attention Network (GAT):</strong> A neural network that analyzes this graph to find suspicious <em>relationships</em>. It learns to "pay attention" to high-risk connections, spotting complex fraud rings and money mule networks.
                                </li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Technology Stack</h2>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Backend</h4>
                                <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
                                    <li>• Flask (Python)</li>
                                    <li>• DGL (Graph Construction) </li>
                                    <li>• PyTorch (for GAT)</li>
                                    <li>• SQLlite DB (Storing Transactions)</li>
                                    <li>• NumPy &amp; Pandas</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend</h4>
                                <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
                                    <li>• React.js</li>
                                    <li>• Tailwind CSS</li>
                                    <li>• Chart.js</li>
                                    <li>• Axios</li>
                                </ul>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Key Features</h2>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start space-x-3">
                                <span className="text-green-500 text-xl">✓</span>
                                <span className="text-gray-800 dark:text-gray-300"><strong>Hybrid AI Detection:</strong> Combines feature-based (RF) and relational (GAT) analysis.</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <span className="text-green-500 text-xl">✓</span>
                                <span className="text-gray-800 dark:text-gray-300"><strong>Comprehensive Analytics:</strong> Interactive charts and detailed transaction history</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <span className="text-green-500 text-xl">✓</span>
                                <span className="text-gray-800 dark:text-gray-300"><strong>Risk Factor Analysis:</strong> Identifies specific factors contributing to fraud risk</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <span className="text-green-500 text-xl">✓</span>
                                <span className="text-gray-800 dark:text-gray-300"><strong>Export Capabilities:</strong> Download transaction data in CSV format</span>
                            </li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Contact</h2>
                        <p className="text-gray-800 dark:text-gray-300 mb-4">
                            For more information about FraudGuard AI or to report issues, please contact:
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="text-gray-800 dark:text-gray-300">📧 Email: support@fraudguard.ai</p>
                            <p className="text-gray-800 dark:text-gray-300">🌐 Website: www.fraudguard.ai</p>
                            <p className="text-gray-800 dark:text-gray-300">📱 Phone: +91 9876501234</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN APP ====================

const App = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <NavigationProvider>
                    <TransactionProvider>
                        <Router />
                    </TransactionProvider>
                </NavigationProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

// Router component with state-based navigation
const Router = () => {
    const { currentPage } = useNavigation();
    const { user } = useAuth();

    // Render the current page
    switch (currentPage) {
        case 'home':
            return <HomePage />;
        case 'login':
            return <LoginPage />;
        case 'about':
            return <AboutPage />;
        case 'dashboard':
            return (
                <ProtectedPage pageName="dashboard">
                    <DashboardPage />
                </ProtectedPage>
            );
        case 'transactions':
            return (
                <ProtectedPage pageName="transactions">
                    <TransactionsPage />
                </ProtectedPage>
            );
        case 'analytics':
            return (
                <ProtectedPage pageName="analytics">
                    <AnalyticsPage />
                </ProtectedPage>
            );
        default:
            return <HomePage />;
    }
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <ThemeProvider>
            <NavigationProvider>
                <TransactionProvider>
                    <App />
                </TransactionProvider>
            </NavigationProvider>
        </ThemeProvider>
    </AuthProvider>
);
