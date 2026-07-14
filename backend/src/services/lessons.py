"""
Curriculum and Lessons Database for the Developer Academy.
Contains rich educational Markdown text, multi-choice quizzes, and smart contract coding exercises.
"""
from typing import Dict, List
from src.models.lesson import QuizQuestion, CodingExercise, Lesson, Course

# ─── LESSON DATABASE ──────────────────────────────────────────────────────────
LESSONS_DB: Dict[str, Lesson] = {
    # ── Level 1: Blockchain Fundamentals
    "1-1": Lesson(
        id="1-1",
        level_id=1,
        title="Introduction to Peer-to-Peer Networks",
        duration="8 mins",
        xp=100,
        content="""# Introduction to Peer-to-Peer Networks

A peer-to-peer (P2P) network is a decentralized communications model in which each party (peer) has equivalent capabilities and can initiate communications. This is in contrast to the traditional client-server model, where some computers are dedicated to serving others.

### Key Concepts:
1. **Decentralization**: No central server acts as a single point of failure.
2. **Distributed Ledger**: Every node keeps a copy of the database.
3. **Consensus**: Nodes must agree on the state of the network.

Web3 relies heavily on P2P networks (like Ethereum DevP2P or LibP2P) to broadcast transactions and blocks to all participants without relying on a centralized intermediary.
""",
        quiz=[
            QuizQuestion(
                question="What is the primary difference between a client-server network and a peer-to-peer network?",
                options=[
                    "Client-server networks have no central authority.",
                    "Peer-to-peer networks distribute data and control equally.",
                    "Peer-to-peer networks are slower and less secure.",
                    "Client-server networks only run on Unix machines."
                ],
                correct_idx=1
            ),
            QuizQuestion(
                question="Which protocol is commonly used in modern blockchains like Ethereum for peer communication?",
                options=["HTTP", "FTP", "DevP2P / LibP2P", "SMTP"],
                correct_idx=2
            )
        ],
        exercise=CodingExercise(
            instruction="Write a basic comment explaining the concept of a decentralized node in your own words. The code should contain the word '// decentralization'.",
            template="// Starter template\n// Write your comment here:\n",
            required_keywords=["decentralization"]
        )
    ),
    "1-2": Lesson(
        id="1-2",
        level_id=1,
        title="Cryptography: Hash Functions & Keys",
        duration="10 mins",
        xp=100,
        content="""# Cryptography: Hash Functions & Keys

Cryptography is the foundation of blockchain security. It enables trustless verification and secures assets using mathematical concepts.

### Hash Functions
A cryptographic hash function takes an input (message) and returns a fixed-size string of bytes (digest).
- **Deterministic**: The same input always produces the same output.
- **One-way**: You cannot reverse-engineer the input from the hash.
- **Collision Resistant**: It is extremely hard to find two different inputs that produce the same output.
- **Example**: Keccak-256 (used in Ethereum) and SHA-256 (used in Bitcoin).

### Public and Private Keys
Blockchains use asymmetric cryptography:
- **Private Key**: A secret number that allows you to sign transactions and spend funds. Keep it secret!
- **Public Key**: Derived mathematically from the private key; acts as your identity on the network.
- **Address**: A shortened hash of your public key (e.g., `0x71C...`).
""",
        quiz=[
            QuizQuestion(
                question="Which hash function is primarily used inside the Ethereum Virtual Machine (EVM)?",
                options=["SHA-256", "MD5", "Keccak-256", "bcrypt"],
                correct_idx=2
            ),
            QuizQuestion(
                question="What is the purpose of a Private Key?",
                options=[
                    "To share publicly as your account number.",
                    "To cryptographically sign transactions and approve transfers.",
                    "To encrypt files on your local hard drive.",
                    "To generate random blocks in mining."
                ],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Create a smart contract comment defining a mock private key variable. The code must contain the word 'privateKey' and 'Keccak256'.",
            template="// Define variables below:\n",
            required_keywords=["privateKey", "Keccak256"]
        )
    ),

    # ── Level 2: Wallet Development
    "2-1": Lesson(
        id="2-1",
        level_id=2,
        title="Understanding HD Wallets & Mnemonic Seeds",
        duration="10 mins",
        xp=150,
        content="""# Hierarchical Deterministic (HD) Wallets & Seed Phrases

An HD Wallet generates a tree structure of keys from a single root seed, which is generated from a human-readable mnemonic seed phrase (typically 12 or 24 words).

### Key Standards:
1. **BIP-39**: Defines the generation of mnemonic phrases and how they map to binary seeds.
2. **BIP-32**: Introduces HD wallet structure, allowing creation of child keys from parent keys.
3. **BIP-44**: Outlines a multi-account hierarchy structure (e.g., `m / purpose' / coin_type' / account' / change / address_index`).

A seed phrase can recover your entire wallet and all generated accounts, making recovery simple.
""",
        quiz=[
            QuizQuestion(
                question="Which BIP standard defines the human-readable 12- or 24-word seed phrase format?",
                options=["BIP-32", "BIP-39", "BIP-44", "ERC-20"],
                correct_idx=1
            ),
            QuizQuestion(
                question="What does the BIP-44 path 'm/44'/60'/0'/0/0' represent?",
                options=[
                    "A Bitcoin address index.",
                    "The first Ethereum address for account 0.",
                    "A smart contract deployment key.",
                    "A consensus validation node."
                ],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a JavaScript/TypeScript pseudocode comment containing the BIP-44 path for Ethereum. Ensure your code contains the exact path string: `m/44'/60'/0'/0/0`.",
            template="// Mnemonic recovery script:\nconst derivationPath = \"\";\n",
            required_keywords=["m/44'/60'/0'/0/0"]
        )
    ),
    "2-2": Lesson(
        id="2-2",
        level_id=2,
        title="Connecting Wallets to DApps (Ethers & Viem)",
        duration="12 mins",
        xp=150,
        content="""# Connecting Wallets to DApps

To interact with Web3 applications (DApps), user browsers use Web3 providers supplied by wallets like MetaMask, Coinbase Wallet, or Rabby.

### Window.ethereum
Wallets inject a global API object at `window.ethereum` into websites. DApps use libraries like **Ethers.js** or **Viem** (often wrapped by **Wagmi** / **RainbowKit**) to interact with it.

### Example connection flow in JS:
```javascript
// Request account access
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
const userAddress = accounts[0];
```
This enables the DApp to read the user's address and request signatures for transactions.
""",
        quiz=[
            QuizQuestion(
                question="What global window object does a browser extension wallet inject?",
                options=["window.web3wallet", "window.ethereum", "window.metamask", "window.provider"],
                correct_idx=1
            ),
            QuizQuestion(
                question="Which RPC method is requested from window.ethereum to prompt the user to connect their wallet?",
                options=["eth_accounts", "eth_requestAccounts", "personal_sign", "eth_connect"],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a comment simulating the request for user accounts using the `eth_requestAccounts` RPC method. The code must contain the keywords `window.ethereum` and `eth_requestAccounts`.",
            template="// Implement wallet connection request below:\n",
            required_keywords=["window.ethereum", "eth_requestAccounts"]
        )
    ),

    # ── Level 3: Smart Contract Development
    "3-1": Lesson(
        id="3-1",
        level_id=3,
        title="Introduction to Solidity & State Variables",
        duration="15 mins",
        xp=200,
        content="""# Solidity & State Variables

Solidity is a statically typed, contract-oriented programming language designed for compiling to Ethereum Virtual Machine (EVM) bytecode.

### Structure of a Solidity Contract:
- **SPDX License**: Specifying license (e.g. `// SPDX-License-Identifier: MIT`).
- **Pragma**: Specifying compiler version compatibility (e.g. `pragma solidity ^0.8.20;`).
- **State Variables**: Variables stored permanently in contract storage.

### Data Types:
- `uint256`: Unsigned integer of 256 bits.
- `address`: Holds a 20-byte Ethereum address.
- `bool`: Boolean.
- `mapping(key => value)`: Hash table mapping keys to values.
""",
        quiz=[
            QuizQuestion(
                question="Which keyword indicates that a variable's value is stored permanently in the contract's blockchain storage?",
                options=["memory", "calldata", "storage", "transient"],
                correct_idx=2
            ),
            QuizQuestion(
                question="What is the size of the standard unsigned integer used in Solidity?",
                options=["uint8", "uint64", "uint256", "uint512"],
                correct_idx=2
            )
        ],
        exercise=CodingExercise(
            instruction="Write a basic Solidity contract structure named `AcademyStore` with a state variable named `storedNumber` of type `uint256`. The code must contain 'contract AcademyStore' and 'uint256 public storedNumber'.",
            template="// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n",
            required_keywords=["contract AcademyStore", "uint256", "storedNumber"]
        )
    ),
    "3-2": Lesson(
        id="3-2",
        level_id=3,
        title="Functions & Modifiers in Solidity",
        duration="15 mins",
        xp=200,
        content="""# Solidity Functions & Modifiers

Functions are the executable units of code within a contract. Modifiers are reusable code blocks used to modify function behavior.

### Function Visibility:
- `public`: Accessible inside and outside the contract.
- `external`: Only accessible outside the contract.
- `internal`: Only accessible inside the contract and derived contracts.
- `private`: Only accessible inside the contract itself.

### Modifiers
Modifiers are run before (or after) the function executes. They are typically used for access controls:
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _; // This represents the function body executing
}
```
""",
        quiz=[
            QuizQuestion(
                question="What does the underscore symbol `_;` represent in a Solidity modifier?",
                options=[
                    "A wildcard parameter.",
                    "The continuation of the function execution flow.",
                    "An exit return statement.",
                    "A private variable reference."
                ],
                correct_idx=1
            ),
            QuizQuestion(
                question="Which function visibility is the most gas-efficient for functions that are only called from outside the blockchain?",
                options=["public", "external", "internal", "private"],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Create a modifier named `onlyAdmin` that requires `msg.sender == admin`. Assume `admin` is already defined as an address. Your code must contain 'modifier onlyAdmin()' and 'require(msg.sender == admin' and '_;'.",
            template="contract AcademyAdmin {\n    address public admin;\n    \n    // Write your modifier below:\n",
            required_keywords=["modifier onlyAdmin()", "msg.sender == admin", "_;"]
        )
    ),

    # ── Level 4: DeFi Fundamentals
    "4-1": Lesson(
        id="4-1",
        level_id=4,
        title="Decentralized Exchanges & Automated Market Makers",
        duration="15 mins",
        xp=250,
        content="""# Automated Market Makers (AMMs)

An Automated Market Maker (AMM) is a Decentralized Exchange (DEX) protocol that relies on mathematical formulas to price assets, rather than traditional order books.

### Constant Product Formula
Uniswap V2 popularized the Constant Product Formula:
$$x \\cdot y = k$$
- $x$: Token balance of Asset A in the liquidity pool.
- $y$: Token balance of Asset B in the liquidity pool.
- $k$: A constant invariant that must remain unchanged during trades (ignoring fees).

When a user buys Token A, they add Token B to the pool, reducing $x$ and increasing $y$. This pushes the relative price of Token A up.
""",
        quiz=[
            QuizQuestion(
                question="What mathematical formula defines the Uniswap V2 Constant Product AMM invariant?",
                options=["x + y = k", "x * y = k", "x^2 + y^2 = k", "x / y = k"],
                correct_idx=1
            ),
            QuizQuestion(
                question="Who provides tokens to a DEX AMM liquidity pool to enable trading?",
                options=["Central Banks", "Liquidity Providers (LPs)", "FastAPI backend services", "GitHub Actions"],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a Solidity public function named `getK` that calculates the product of two state variables `tokenABalance` and `tokenBBalance` and returns it as a `uint256`. The code must contain 'function getK()' and 'return tokenABalance * tokenBBalance;'.",
            template="contract AMMPool {\n    uint256 public tokenABalance;\n    uint256 public tokenBBalance;\n    \n    // Write function getK below:\n",
            required_keywords=["function getK()", "tokenABalance * tokenBBalance"]
        )
    ),

    # ── Level 5: DAO Governance
    "5-1": Lesson(
        id="5-1",
        level_id=5,
        title="DAO Mechanics & Voting Structures",
        duration="12 mins",
        xp=250,
        content="""# Decentralized Autonomous Organizations (DAOs)

A DAO is an organization represented by rules encoded as a computer program that is transparent, controlled by the organization members, and not influenced by a central government.

### Typical Lifecycle of a DAO Proposal:
1. **Creation**: A token holder creates a proposal (e.g. allocate funds, change parameter).
2. **Voting**: Token holders cast votes using their governance tokens (delegated or native).
3. **Queueing**: If approved, the proposal enters a Timelock contract to allow users to leave the DAO if they disagree.
4. **Execution**: The proposal's transactions are dispatched and run on-chain.
""",
        quiz=[
            QuizQuestion(
                question="What is the purpose of a Timelock contract in DAO governance?",
                options=[
                    "To speed up the voting process.",
                    "To delay approved proposals, giving users time to withdraw funds if they disagree with the outcome.",
                    "To secure the database against unauthorized access.",
                    "To generate mining rewards."
                ],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a comment simulating the status check of a DAO proposal. Include the words `ProposalState` and `Executed` in your comment.",
            template="// DAO Proposal State check:\n",
            required_keywords=["ProposalState", "Executed"]
        )
    ),

    # ── Level 6: MOR Finance Protocols
    "6-1": Lesson(
        id="6-1",
        level_id=6,
        title="Morpheus Network & AI-Compute Agents",
        duration="15 mins",
        xp=300,
        content="""# Morpheus Network (MOR Finance)

Morpheus is a decentralized network that connects AI Compute Providers, Smart Agent Creators, and End Users through smart contracts.

### How it works:
1. **Compute Providers**: Offer GPU resources to run LLMs.
2. **Smart Agents**: AI systems designed to perform operations on the blockchain (e.g., execute trades, monitor prices).
3. **MOR Token**: Rewards compute providers and developers, aligning economic incentives.
""",
        quiz=[
            QuizQuestion(
                question="What are 'Smart Agents' in the Morpheus Network?",
                options=[
                    "Human smart contract auditors.",
                    "AI systems that can execute smart contract operations on behalf of users.",
                    "Automated web servers.",
                    "Specialized node mining hardware."
                ],
                correct_idx=1
            )
        ],
        exercise=CodingExercise(
            instruction="Write a contract comment that references compute bidding. It must contain the keywords `GPU compute` and `bidding reward`.",
            template="// Write your Compute reward notes:\n",
            required_keywords=["GPU compute", "bidding reward"]
        )
    )
}

def get_courses_list() -> List[Course]:
    """Compile courses from levels metadata and lesson details."""
    levels_meta = [
        {"id": 1, "title": "Blockchain Fundamentals"},
        {"id": 2, "title": "Wallet Development"},
        {"id": 3, "title": "Smart Contract Development"},
        {"id": 4, "title": "DeFi Fundamentals"},
        {"id": 5, "title": "DAO Governance"},
        {"id": 6, "title": "MOR Finance Protocols"},
    ]
    courses = []
    for lm in levels_meta:
        level_id = lm["id"]
        lessons = [l for l in LESSONS_DB.values() if l.level_id == level_id]
        courses.append(
            Course(
                level_id=level_id,
                title=lm["title"],
                total_lessons=len(lessons),
                lessons=lessons
            )
        )
    return courses
